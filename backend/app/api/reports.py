import os
import json
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Claim, Report, User, AuditLog
from app.api.auth import get_current_user
from app.services.report_service import generate_claim_pdf_report

router = APIRouter(prefix="", tags=["Reports"])


@router.post("/claims/{claim_id}/generate-report")
def create_report(
    claim_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    fld = claim.field
    farm = fld.farm if fld else None
    farmer = claim.farmer

    sat_dict = {}
    if claim.satellite_record:
        sr = claim.satellite_record
        sat_dict = {
            "pre_disaster_date": sr.pre_disaster_date,
            "post_disaster_date": sr.post_disaster_date,
            "pre_ndvi": sr.pre_ndvi,
            "post_ndvi": sr.post_ndvi,
            "ndvi_change_pct": sr.ndvi_change_pct,
            "valid_pixel_pct": sr.valid_pixel_pct,
            "cloud_cover_pct": sr.cloud_cover_pct,
            "provider": sr.provider
        }

    weath_dict = {}
    if claim.weather_record:
        wr = claim.weather_record
        weath_dict = {
            "start_date": wr.start_date,
            "end_date": wr.end_date,
            "total_rainfall_mm": wr.total_rainfall_mm,
            "max_daily_rainfall_mm": wr.max_daily_rainfall_mm,
            "rainfall_anomaly_pct": wr.rainfall_anomaly_pct,
            "provider": wr.provider
        }

    assess_dict = {}
    if claim.assessment_record:
        ar = claim.assessment_record
        assess_dict = {
            "finding_category": ar.finding_category,
            "severity_score": ar.severity_score,
            "confidence_level": ar.confidence_level,
            "summary": ar.summary
        }

    claim_data = {
        "claim_number": claim.claim_number,
        "farmer_name": farmer.full_name if farmer else "N/A",
        "farm_name": farm.name if farm else "N/A",
        "crop": fld.crop if fld else "Paddy",
        "crop_variety": fld.crop_variety if fld else "Standard",
        "area_acres": fld.area_acres if fld else 1.0,
        "disaster_type": claim.disaster_type,
        "incident_date": claim.incident_date,
        "status": claim.status,
        "digipin": fld.digipin if fld else "39J49LL8T4",
        "digipin_display": fld.digipin_display if fld else "39J 49LL 8T4",
        "centroid_lat": fld.centroid_lat if fld else 28.622788,
        "centroid_lon": fld.centroid_lon if fld else 77.213033,
        "satellite": sat_dict,
        "weather": weath_dict,
        "assessment": assess_dict
    }

    report_uuid, pdf_path, sha256_hash, qr_data = generate_claim_pdf_report(claim_data)
    file_size = os.path.getsize(pdf_path)

    # Check if report already exists for this claim
    existing_report = db.query(Report).filter(Report.claim_id == claim.id).first()
    if existing_report:
        existing_report.report_uuid = report_uuid
        existing_report.file_path = pdf_path
        existing_report.file_size_bytes = file_size
        existing_report.sha256_hash = sha256_hash
        existing_report.verification_qr_data = qr_data
        report_record = existing_report
    else:
        report_record = Report(
            claim_id=claim.id,
            report_uuid=report_uuid,
            file_path=pdf_path,
            file_size_bytes=file_size,
            sha256_hash=sha256_hash,
            verification_qr_data=qr_data,
            download_count=0
        )
        db.add(report_record)

    audit = AuditLog(
        user_id=current_user.id,
        action="REPORT_GENERATED",
        entity_type="REPORT",
        entity_id=report_uuid,
        details=f"PDF report dossier generated with SHA-256 hash {sha256_hash[:16]}..."
    )
    db.add(audit)
    db.commit()

    return {
        "report_uuid": report_uuid,
        "file_path": pdf_path,
        "sha256_hash": sha256_hash,
        "verification_qr_data": qr_data,
        "download_url": f"/api/reports/{report_uuid}/download"
    }


@router.get("/reports/{report_uuid}/download")
def download_report(report_uuid: str, db: Session = Depends(get_db)):
    rep = db.query(Report).filter(Report.report_uuid == report_uuid).first()
    if not rep or not os.path.exists(rep.file_path):
        raise HTTPException(status_code=404, detail="Report dossier not found")

    rep.download_count += 1
    db.commit()

    return FileResponse(
        rep.file_path,
        media_type="application/pdf",
        filename=os.path.basename(rep.file_path)
    )
