import random
import json
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import (
    Claim, Field, Farm, User, Evidence,
    SatelliteAnalysis, WeatherAnalysis, Assessment, Report, ClaimReview, AuditLog
)
from app.schemas.schemas import ClaimCreate, ClaimOut
from app.api.auth import get_current_user
from app.services.satellite_service import analyze_sentinel2_ndvi
from app.services.weather_service import fetch_historical_weather
from app.services.assessment_service import evaluate_claim_assessment

router = APIRouter(prefix="/claims", tags=["Claims"])

def _format_claim_out(c: Claim) -> ClaimOut:
    fld = c.field
    farm = fld.farm if fld else None
    farmer = c.farmer

    evidence_list = []
    for ev in c.evidence_list:
        evidence_list.append({
            "id": ev.id,
            "filename": ev.filename,
            "file_size_bytes": ev.file_size_bytes,
            "mime_type": ev.mime_type,
            "sha256_hash": ev.sha256_hash,
            "exif_lat": ev.exif_lat,
            "exif_lon": ev.exif_lon,
            "exif_timestamp": ev.exif_timestamp,
            "exif_camera": ev.exif_camera,
            "distance_to_field_m": ev.distance_to_field_m
        })

    sat_out = None
    if c.satellite_record:
        sr = c.satellite_record
        sat_out = {
            "pre_disaster_date": sr.pre_disaster_date,
            "post_disaster_date": sr.post_disaster_date,
            "pre_ndvi": sr.pre_ndvi,
            "post_ndvi": sr.post_ndvi,
            "ndvi_delta": sr.ndvi_delta,
            "ndvi_change_pct": sr.ndvi_change_pct,
            "valid_pixel_pct": sr.valid_pixel_pct,
            "cloud_cover_pct": sr.cloud_cover_pct,
            "provider": sr.provider
        }

    weath_out = None
    if c.weather_record:
        wr = c.weather_record
        daily_parsed = []
        try:
            daily_parsed = json.loads(wr.daily_records_json)
        except Exception:
            pass
        weath_out = {
            "start_date": wr.start_date,
            "end_date": wr.end_date,
            "total_rainfall_mm": wr.total_rainfall_mm,
            "max_daily_rainfall_mm": wr.max_daily_rainfall_mm,
            "historical_avg_rainfall_mm": wr.historical_avg_rainfall_mm,
            "rainfall_anomaly_pct": wr.rainfall_anomaly_pct,
            "daily_records": daily_parsed,
            "provider": wr.provider
        }

    assess_out = None
    if c.assessment_record:
        ar = c.assessment_record
        rules_parsed = []
        try:
            rules_parsed = json.loads(ar.rules_triggered_json)
        except Exception:
            pass
        assess_out = {
            "finding_category": ar.finding_category,
            "severity_score": ar.severity_score,
            "confidence_level": ar.confidence_level,
            "summary": ar.summary,
            "rules_triggered": rules_parsed,
            "methodology_version": ar.methodology_version
        }

    rep_out = None
    if c.report_record:
        rr = c.report_record
        rep_out = {
            "report_uuid": rr.report_uuid,
            "file_path": rr.file_path,
            "sha256_hash": rr.sha256_hash,
            "verification_qr_data": rr.verification_qr_data,
            "download_url": f"/api/reports/{rr.report_uuid}/download"
        }

    reviews_out = []
    for r in c.reviews:
        reviews_out.append({
            "id": r.id,
            "officer_name": r.officer.full_name if r.officer else "Reviewing Officer",
            "decision": r.decision,
            "remarks": r.remarks,
            "evidence_requested": r.evidence_requested,
            "created_at": r.created_at.strftime("%Y-%m-%d %H:%M")
        })

    return ClaimOut(
        id=c.id,
        claim_number=c.claim_number,
        farmer_id=c.farmer_id,
        farmer_name=farmer.full_name if farmer else "N/A",
        field_id=c.field_id,
        field_name=fld.name if fld else "N/A",
        farm_name=farm.name if farm else "N/A",
        crop=fld.crop if fld else "N/A",
        area_acres=fld.area_acres if fld else 1.0,
        digipin=fld.digipin if fld else "",
        digipin_display=fld.digipin_display if fld else "",
        centroid_lat=fld.centroid_lat if fld else 0.0,
        centroid_lon=fld.centroid_lon if fld else 0.0,
        polygon_geojson=fld.polygon_geojson if fld else "{}",
        disaster_type=c.disaster_type,
        incident_date=c.incident_date,
        duration_days=c.duration_days,
        description=c.description,
        status=c.status,
        created_at=c.created_at.strftime("%Y-%m-%d %H:%M"),
        evidence=evidence_list,
        satellite=sat_out,
        weather=weath_out,
        assessment=assess_out,
        report=rep_out,
        reviews=reviews_out
    )


@router.get("", response_model=List[ClaimOut])
def list_claims(
    status_filter: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Claim)
    if current_user.role == "farmer":
        query = query.filter(Claim.farmer_id == current_user.id)
    if status_filter:
        query = query.filter(Claim.status == status_filter)

    claims = query.order_by(Claim.created_at.desc()).all()
    return [_format_claim_out(c) for c in claims]


@router.post("", response_model=ClaimOut)
def create_claim(
    req: ClaimCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    fld = db.query(Field).filter(Field.id == req.field_id).first()
    if not fld:
        raise HTTPException(status_code=404, detail="Field not found")

    # Generate sequential unique claim number
    claim_num = f"CLM-2026-{random.randint(10000, 99999)}"

    claim = Claim(
        claim_number=claim_num,
        farmer_id=current_user.id,
        field_id=req.field_id,
        disaster_type=req.disaster_type,
        incident_date=req.incident_date,
        duration_days=req.duration_days,
        description=req.description,
        status="submitted"
    )
    db.add(claim)
    db.flush()

    # Trigger Satellite NDVI analysis
    sat_res = analyze_sentinel2_ndvi(
        fld.centroid_lat,
        fld.centroid_lon,
        claim.disaster_type,
        claim.incident_date
    )
    sat_record = SatelliteAnalysis(
        claim_id=claim.id,
        pre_disaster_date=sat_res["pre_disaster_date"],
        post_disaster_date=sat_res["post_disaster_date"],
        pre_ndvi=sat_res["pre_ndvi"],
        post_ndvi=sat_res["post_ndvi"],
        ndvi_delta=sat_res["ndvi_delta"],
        ndvi_change_pct=sat_res["ndvi_change_pct"],
        valid_pixel_pct=sat_res["valid_pixel_pct"],
        cloud_cover_pct=sat_res["cloud_cover_pct"],
        provider=sat_res["provider"],
        processing_time_ms=sat_res["processing_time_ms"]
    )
    db.add(sat_record)

    # Trigger Weather analysis
    weath_res = fetch_historical_weather(
        fld.centroid_lat,
        fld.centroid_lon,
        claim.disaster_type,
        claim.incident_date
    )
    weath_record = WeatherAnalysis(
        claim_id=claim.id,
        start_date=weath_res["start_date"],
        end_date=weath_res["end_date"],
        total_rainfall_mm=weath_res["total_rainfall_mm"],
        max_daily_rainfall_mm=weath_res["max_daily_rainfall_mm"],
        historical_avg_rainfall_mm=weath_res["historical_avg_rainfall_mm"],
        rainfall_anomaly_pct=weath_res["rainfall_anomaly_pct"],
        daily_records_json=json.dumps(weath_res["daily_records"]),
        provider=weath_res["provider"]
    )
    db.add(weath_record)

    # Trigger Preliminary Assessment Evaluation
    eval_res = evaluate_claim_assessment(
        claim.id,
        claim.disaster_type,
        sat_res,
        weath_res,
        []
    )
    assess_record = Assessment(
        claim_id=claim.id,
        finding_category=eval_res["finding_category"],
        severity_score=eval_res["severity_score"],
        confidence_level=eval_res["confidence_level"],
        summary=eval_res["summary"],
        rules_triggered_json=json.dumps(eval_res["rules_triggered"]),
        methodology_version=eval_res["methodology_version"]
    )
    db.add(assess_record)

    audit = AuditLog(
        user_id=current_user.id,
        action="CLAIM_SUBMITTED",
        entity_type="CLAIM",
        entity_id=str(claim.id),
        details=f"Claim {claim_num} submitted for field {fld.name} with DIGIPIN {fld.digipin}"
    )
    db.add(audit)

    db.commit()
    db.refresh(claim)
    return _format_claim_out(claim)


@router.get("/{claim_id}", response_model=ClaimOut)
def get_claim(
    claim_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    c = db.query(Claim).filter(Claim.id == claim_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Claim not found")
    if current_user.role == "farmer" and c.farmer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Permission denied")

    return _format_claim_out(c)
