from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Claim, ClaimReview, User, AuditLog
from app.schemas.schemas import ReviewCreate
from app.api.auth import get_current_user

router = APIRouter(prefix="/claims", tags=["Reviews"])

@router.post("/{claim_id}/review")
def review_claim(
    claim_id: int,
    req: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ["officer", "admin"]:
        raise HTTPException(status_code=403, detail="Only officers or admins may record claim reviews")

    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    rev = ClaimReview(
        claim_id=claim.id,
        officer_id=current_user.id,
        decision=req.decision,
        remarks=req.remarks,
        evidence_requested=req.evidence_requested
    )
    db.add(rev)

    # Update claim status
    claim.status = req.decision

    audit = AuditLog(
        user_id=current_user.id,
        action="CLAIM_REVIEWED",
        entity_type="CLAIM",
        entity_id=str(claim.id),
        details=f"Officer {current_user.full_name} recorded decision: {req.decision}"
    )
    db.add(audit)

    db.commit()
    db.refresh(rev)

    return {
        "id": rev.id,
        "officer_name": current_user.full_name,
        "decision": rev.decision,
        "remarks": rev.remarks,
        "evidence_requested": rev.evidence_requested,
        "created_at": rev.created_at.strftime("%Y-%m-%d %H:%M")
    }
