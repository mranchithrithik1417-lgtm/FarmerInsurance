from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Field, Farm, User
from app.schemas.schemas import FieldCreate, FieldOut
from app.api.auth import get_current_user
from app.services.farm_service import parse_geometry_and_calculate_centroid, generate_field_digipin

router = APIRouter(prefix="/fields", tags=["Fields"])

@router.get("", response_model=List[FieldOut])
def list_fields(
    farm_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Field)
    if farm_id:
        query = query.filter(Field.farm_id == farm_id)

    if current_user.role == "farmer":
        query = query.join(Farm).filter(Farm.farmer_id == current_user.id)

    fields = query.all()
    out = []
    for fld in fields:
        out.append(FieldOut(
            id=fld.id,
            farm_id=fld.farm_id,
            farm_name=fld.farm.name if fld.farm else None,
            name=fld.name,
            crop=fld.crop,
            crop_variety=fld.crop_variety,
            sowing_date=fld.sowing_date,
            cultivation_season=fld.cultivation_season,
            area_acres=fld.area_acres,
            polygon_geojson=fld.polygon_geojson,
            centroid_lat=fld.centroid_lat,
            centroid_lon=fld.centroid_lon,
            digipin=fld.digipin,
            digipin_display=fld.digipin_display
        ))
    return out


@router.post("", response_model=FieldOut)
def create_field(
    req: FieldCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    farm = db.query(Farm).filter(Farm.id == req.farm_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    if current_user.role == "farmer" and farm.farmer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Permission denied for this farm")

    try:
        c_lat, c_lon, area_acres, norm_geojson = parse_geometry_and_calculate_centroid(req.polygon_geojson)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Polygon geometry error: {str(e)}")

    try:
        digipin_code, digipin_display = generate_field_digipin(c_lat, c_lon)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"DIGIPIN generation error: {str(e)}")

    field = Field(
        farm_id=req.farm_id,
        name=req.name,
        crop=req.crop,
        crop_variety=req.crop_variety,
        sowing_date=req.sowing_date,
        cultivation_season=req.cultivation_season,
        area_acres=area_acres,
        polygon_geojson=norm_geojson,
        centroid_lat=c_lat,
        centroid_lon=c_lon,
        digipin=digipin_code,
        digipin_display=digipin_display
    )
    db.add(field)
    db.commit()
    db.refresh(field)

    return FieldOut(
        id=field.id,
        farm_id=field.farm_id,
        farm_name=farm.name,
        name=field.name,
        crop=field.crop,
        crop_variety=field.crop_variety,
        sowing_date=field.sowing_date,
        cultivation_season=field.cultivation_season,
        area_acres=field.area_acres,
        polygon_geojson=field.polygon_geojson,
        centroid_lat=field.centroid_lat,
        centroid_lon=field.centroid_lon,
        digipin=field.digipin,
        digipin_display=field.digipin_display
    )


@router.get("/{field_id}", response_model=FieldOut)
def get_field(
    field_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    fld = db.query(Field).filter(Field.id == field_id).first()
    if not fld:
        raise HTTPException(status_code=404, detail="Field not found")

    return FieldOut(
        id=fld.id,
        farm_id=fld.farm_id,
        farm_name=fld.farm.name if fld.farm else None,
        name=fld.name,
        crop=fld.crop,
        crop_variety=fld.crop_variety,
        sowing_date=fld.sowing_date,
        cultivation_season=fld.cultivation_season,
        area_acres=fld.area_acres,
        polygon_geojson=fld.polygon_geojson,
        centroid_lat=fld.centroid_lat,
        centroid_lon=fld.centroid_lon,
        digipin=fld.digipin,
        digipin_display=fld.digipin_display
    )
