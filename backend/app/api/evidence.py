import os
import shutil
import uuid
import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.models.models import Claim, Evidence, User, Assessment, AuditLog
from app.api.auth import get_current_user
from app.services.evidence_service import (
    get_file_sha256,
    extract_exif_metadata,
    calculate_haversine_distance_m
)
from app.services.assessment_service import evaluate_claim_assessment

router = APIRouter(prefix="/claims", tags=["Evidence"])


@router.post("/{claim_id}/evidence")
async def upload_evidence(
    claim_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    if current_user.role == "farmer" and claim.farmer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Permission denied")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File extension {ext} not allowed. Supported: JPG, PNG, WEBP")

    safe_filename = f"ev_{claim.id}_{uuid.uuid4().hex[:8]}{ext}"
    dest_path = os.path.join(settings.UPLOAD_PATH, safe_filename)

    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = os.path.getsize(dest_path)
    if file_size > settings.MAX_UPLOAD_SIZE_BYTES:
        os.remove(dest_path)
        raise HTTPException(status_code=400, detail="File size exceeds maximum allowed 15MB")

    # Calculate SHA-256 hash
    sha256_hash = get_file_sha256(dest_path)

    # Extract EXIF metadata
    exif = extract_exif_metadata(dest_path)
    dist_m = None

    if exif["has_gps"] and claim.field:
        dist_m = calculate_haversine_distance_m(
            exif["lat"],
            exif["lon"],
            claim.field.centroid_lat,
            claim.field.centroid_lon
        )

    ev = Evidence(
        claim_id=claim.id,
        filename=file.filename,
        file_path=dest_path,
        file_size_bytes=file_size,
        mime_type=file.content_type or "image/jpeg",
        sha256_hash=sha256_hash,
        exif_lat=exif.get("lat"),
        exif_lon=exif.get("lon"),
        exif_timestamp=exif.get("timestamp"),
        exif_camera=exif.get("camera"),
        distance_to_field_m=dist_m
    )
    db.add(ev)
    claim.status = "evidence_processing"
    db.flush()

    # Re-evaluate assessment with new photographic evidence
    ev_list = []
    for item in claim.evidence_list:
        ev_list.append({
            "exif_lat": item.exif_lat,
            "exif_lon": item.exif_lon,
            "distance_to_field_m": item.distance_to_field_m
        })

    sat_data = {}
    if claim.satellite_record:
        sat_data = {
            "pre_ndvi": claim.satellite_record.pre_ndvi,
            "post_ndvi": claim.satellite_record.post_ndvi,
            "ndvi_change_pct": claim.satellite_record.ndvi_change_pct
        }

    weath_data = {}
    if claim.weather_record:
        weath_data = {
            "total_rainfall_mm": claim.weather_record.total_rainfall_mm,
            "rainfall_anomaly_pct": claim.weather_record.rainfall_anomaly_pct
        }

    eval_res = evaluate_claim_assessment(
        claim.id,
        claim.disaster_type,
        sat_data,
        weath_data,
        ev_list
    )

    if claim.assessment_record:
        claim.assessment_record.finding_category = eval_res["finding_category"]
        claim.assessment_record.severity_score = eval_res["severity_score"]
        claim.assessment_record.confidence_level = eval_res["confidence_level"]
        claim.assessment_record.summary = eval_res["summary"]
        claim.assessment_record.rules_triggered_json = json.dumps(eval_res["rules_triggered"])
    
    claim.status = "under_review"

    audit = AuditLog(
        user_id=current_user.id,
        action="EVIDENCE_UPLOADED",
        entity_type="CLAIM",
        entity_id=str(claim.id),
        details=f"Photo uploaded ({file.filename}) with EXIF GPS: {exif['has_gps']}"
    )
    db.add(audit)

    db.commit()
    db.refresh(ev)

    return {
        "id": ev.id,
        "filename": ev.filename,
        "file_size_bytes": ev.file_size_bytes,
        "sha256_hash": ev.sha256_hash,
        "exif_lat": ev.exif_lat,
        "exif_lon": ev.exif_lon,
        "exif_timestamp": ev.exif_timestamp,
        "exif_camera": ev.exif_camera,
        "distance_to_field_m": ev.distance_to_field_m
    }
