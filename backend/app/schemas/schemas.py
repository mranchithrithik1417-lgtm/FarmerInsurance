from typing import Optional, List, Any, Dict
from pydantic import BaseModel, EmailStr

# Auth & User schemas
class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str
    phone: Optional[str] = None
    role: str = "farmer"  # 'farmer', 'officer', 'admin'
    # Optional profile info
    state: Optional[str] = "Karnataka"
    district: Optional[str] = "Mandya"
    taluk: Optional[str] = "Maddur"
    village: Optional[str] = "Kestur"
    department: Optional[str] = None
    designation: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    phone: Optional[str]
    role: str
    is_active: bool

# Farm & Field schemas
class FarmCreate(BaseModel):
    name: str
    state: str
    district: str
    taluk: str
    village: str
    address: Optional[str] = None

class FarmOut(BaseModel):
    id: int
    farmer_id: int
    name: str
    state: str
    district: str
    taluk: str
    village: str
    address: Optional[str]
    fields_count: int = 0

class FieldCreate(BaseModel):
    farm_id: int
    name: str
    crop: str
    crop_variety: Optional[str] = None
    sowing_date: Optional[str] = None
    cultivation_season: str = "Kharif"
    polygon_geojson: str  # GeoJSON string or coordinate list

class FieldOut(BaseModel):
    id: int
    farm_id: int
    farm_name: Optional[str] = None
    name: str
    crop: str
    crop_variety: Optional[str]
    sowing_date: Optional[str]
    cultivation_season: str
    area_acres: float
    polygon_geojson: str
    centroid_lat: float
    centroid_lon: float
    digipin: str
    digipin_display: str

# DIGIPIN schemas
class DigipinEncodeRequest(BaseModel):
    latitude: float
    longitude: float

class DigipinEncodeResponse(BaseModel):
    digipin: str
    display_format: str
    latitude: float
    longitude: float

class DigipinDecodeRequest(BaseModel):
    digipin: str

class DigipinDecodeResponse(BaseModel):
    valid: bool
    digipin: str
    display_format: str
    center_lat: float
    center_lon: float
    min_lat: float
    max_lat: float
    min_lon: float
    max_lon: float
    cell_size_lat_deg: float
    cell_size_lon_deg: float
    cell_height_m_approx: float
    cell_width_m_approx: float

# Claim schemas
class ClaimCreate(BaseModel):
    field_id: int
    disaster_type: str
    incident_date: str
    duration_days: int = 1
    description: Optional[str] = None

class EvidenceOut(BaseModel):
    id: int
    filename: str
    file_size_bytes: int
    mime_type: str
    sha256_hash: str
    exif_lat: Optional[float]
    exif_lon: Optional[float]
    exif_timestamp: Optional[str]
    exif_camera: Optional[str]
    distance_to_field_m: Optional[float]

class SatelliteOut(BaseModel):
    pre_disaster_date: str
    post_disaster_date: str
    pre_ndvi: float
    post_ndvi: float
    ndvi_delta: float
    ndvi_change_pct: float
    valid_pixel_pct: float
    cloud_cover_pct: float
    provider: str

class WeatherOut(BaseModel):
    start_date: str
    end_date: str
    total_rainfall_mm: float
    max_daily_rainfall_mm: float
    historical_avg_rainfall_mm: float
    rainfall_anomaly_pct: float
    daily_records: List[Dict[str, Any]]
    provider: str

class AssessmentOut(BaseModel):
    finding_category: str
    severity_score: float
    confidence_level: str
    summary: str
    rules_triggered: List[Dict[str, Any]]
    methodology_version: str

class ReportOut(BaseModel):
    report_uuid: str
    file_path: str
    sha256_hash: str
    verification_qr_data: str
    download_url: str

class ReviewCreate(BaseModel):
    decision: str  # 'approved', 'rejected', 'additional_evidence_required', 'under_review'
    remarks: str
    evidence_requested: Optional[str] = None

class ReviewOut(BaseModel):
    id: int
    officer_name: str
    decision: str
    remarks: str
    evidence_requested: Optional[str]
    created_at: str

class ClaimOut(BaseModel):
    id: int
    claim_number: str
    farmer_id: int
    farmer_name: str
    field_id: int
    field_name: str
    farm_name: str
    crop: str
    area_acres: float
    digipin: str
    digipin_display: str
    centroid_lat: float
    centroid_lon: float
    polygon_geojson: str
    disaster_type: str
    incident_date: str
    duration_days: int
    description: Optional[str]
    status: str
    created_at: str
    evidence: List[EvidenceOut] = []
    satellite: Optional[SatelliteOut] = None
    weather: Optional[WeatherOut] = None
    assessment: Optional[AssessmentOut] = None
    report: Optional[ReportOut] = None
    reviews: List[ReviewOut] = []
