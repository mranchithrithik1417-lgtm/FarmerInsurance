from fastapi import APIRouter, HTTPException, Query
from app.digipin.digipin import (
    encode_digipin,
    decode_digipin,
    format_digipin_display,
    get_digipin_hierarchy
)
from app.schemas.schemas import (
    DigipinEncodeRequest,
    DigipinEncodeResponse,
    DigipinDecodeRequest,
    DigipinDecodeResponse
)

router = APIRouter(prefix="/digipin", tags=["DIGIPIN"])


@router.post("/encode", response_model=DigipinEncodeResponse)
def api_encode_digipin(req: DigipinEncodeRequest):
    try:
        code = encode_digipin(req.latitude, req.longitude)
        disp = format_digipin_display(code)
        return {
            "digipin": code,
            "display_format": disp,
            "latitude": req.latitude,
            "longitude": req.longitude
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/decode", response_model=DigipinDecodeResponse)
def api_decode_digipin(req: DigipinDecodeRequest):
    try:
        res = decode_digipin(req.digipin)
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/hierarchy")
def api_digipin_hierarchy(
    lat: float = Query(28.622788, description="Target latitude (Dak Bhawan reference default)"),
    lon: float = Query(77.213033, description="Target longitude (Dak Bhawan reference default)")
):
    """
    Returns complete 10-level hierarchical subdivision breakdown
    for the interactive educational 4x4 grid explorer.
    """
    try:
        return get_digipin_hierarchy(lat, lon)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
