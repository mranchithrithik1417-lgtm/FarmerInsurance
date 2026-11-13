from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Farm, User
from app.schemas.schemas import FarmCreate, FarmOut
from app.api.auth import get_current_user

router = APIRouter(prefix="/farms", tags=["Farms"])

@router.get("", response_model=List[FarmOut])
def list_farms(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role in ["officer", "admin"]:
        farms = db.query(Farm).all()
    else:
        farms = db.query(Farm).filter(Farm.farmer_id == current_user.id).all()

    out = []
    for f in farms:
        out.append(FarmOut(
            id=f.id,
            farmer_id=f.farmer_id,
            name=f.name,
            state=f.state,
            district=f.district,
            taluk=f.taluk,
            village=f.village,
            address=f.address,
            fields_count=len(f.fields)
        ))
    return out


@router.post("", response_model=FarmOut)
def create_farm(
    req: FarmCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    farm = Farm(
        farmer_id=current_user.id,
        name=req.name,
        state=req.state,
        district=req.district,
        taluk=req.taluk,
        village=req.village,
        address=req.address
    )
    db.add(farm)
    db.commit()
    db.refresh(farm)
    return FarmOut(
        id=farm.id,
        farmer_id=farm.farmer_id,
        name=farm.name,
        state=farm.state,
        district=farm.district,
        taluk=farm.taluk,
        village=farm.village,
        address=farm.address,
        fields_count=0
    )


@router.get("/{farm_id}", response_model=FarmOut)
def get_farm(
    farm_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    farm = db.query(Farm).filter(Farm.id == farm_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    if current_user.role == "farmer" and farm.farmer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Permission denied")

    return FarmOut(
        id=farm.id,
        farmer_id=farm.farmer_id,
        name=farm.name,
        state=farm.state,
        district=farm.district,
        taluk=farm.taluk,
        village=farm.village,
        address=farm.address,
        fields_count=len(farm.fields)
    )
