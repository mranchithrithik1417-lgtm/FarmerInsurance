from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import User, Farm, Field, Claim, AuditLog
from app.api.auth import get_current_user

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/stats")
def get_admin_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin" and current_user.role != "officer":
        raise HTTPException(status_code=403, detail="Admin or Officer role required")

    total_farmers = db.query(User).filter(User.role == "farmer").count()
    total_officers = db.query(User).filter(User.role == "officer").count()
    total_farms = db.query(Farm).count()
    total_fields = db.query(Field).count()
    total_claims = db.query(Claim).count()
    approved_claims = db.query(Claim).filter(Claim.status == "approved").count()
    rejected_claims = db.query(Claim).filter(Claim.status == "rejected").count()
    pending_claims = db.query(Claim).filter(Claim.status.in_(["submitted", "under_review", "evidence_processing"])).count()
    
    # Calculate total acres monitored
    fields = db.query(Field).all()
    total_acres = round(sum(f.area_acres for f in fields), 1)

    return {
        "total_farmers": total_farmers,
        "total_officers": total_officers,
        "total_farms": total_farms,
        "total_fields": total_fields,
        "total_claims": total_claims,
        "approved_claims": approved_claims,
        "rejected_claims": rejected_claims,
        "pending_claims": pending_claims,
        "total_monitored_acres": total_acres,
        "satellite_service_status": "Online (Copernicus Sentinel-2 MSI)",
        "weather_service_status": "Online (Open-Meteo Historical Archive)",
        "digipin_engine_status": "Online (India Post 10-Level EPSG:4326)"
    }


@router.get("/users")
def get_admin_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin role required")

    users = db.query(User).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "phone": u.phone,
            "role": u.role,
            "is_active": u.is_active,
            "created_at": u.created_at.strftime("%Y-%m-%d")
        }
        for u in users
    ]


@router.get("/audit-logs")
def get_audit_logs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin role required")

    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(100).all()
    return [
        {
            "id": l.id,
            "user_id": l.user_id,
            "action": l.action,
            "entity_type": l.entity_type,
            "entity_id": l.entity_id,
            "details": l.details,
            "timestamp": l.timestamp.strftime("%Y-%m-%d %H:%M:%S")
        }
        for l in logs
    ]
