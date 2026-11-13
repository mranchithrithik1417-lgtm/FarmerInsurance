import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    role = Column(String(50), default="farmer", index=True, nullable=False)  # 'farmer', 'officer', 'admin'
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    farmer_profile = relationship("FarmerProfile", back_populates="user", uselist=False)
    officer_profile = relationship("OfficerProfile", back_populates="user", uselist=False)
    farms = relationship("Farm", back_populates="farmer")
    claims = relationship("Claim", back_populates="farmer")
    notifications = relationship("Notification", back_populates="user")


class FarmerProfile(Base):
    __tablename__ = "farmer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    aadhar_last4 = Column(String(4), nullable=True)
    state = Column(String(100), default="Karnataka")
    district = Column(String(100), default="Mandya")
    taluk = Column(String(100), default="Maddur")
    village = Column(String(100), default="Kestur")
    preferred_language = Column(String(10), default="en")

    user = relationship("User", back_populates="farmer_profile")


class OfficerProfile(Base):
    __tablename__ = "officer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    department = Column(String(150), default="Department of Agriculture")
    designation = Column(String(150), default="Agricultural Officer")
    jurisdiction_district = Column(String(100), default="Mandya")

    user = relationship("User", back_populates="officer_profile")


class Farm(Base):
    __tablename__ = "farms"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(200), nullable=False)
    state = Column(String(100), nullable=False)
    district = Column(String(100), nullable=False)
    taluk = Column(String(100), nullable=False)
    village = Column(String(100), nullable=False)
    address = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    farmer = relationship("User", back_populates="farms")
    fields = relationship("Field", back_populates="farm", cascade="all, delete-orphan")


class Field(Base):
    __tablename__ = "fields"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    name = Column(String(200), nullable=False)
    crop = Column(String(100), nullable=False)
    crop_variety = Column(String(100), nullable=True)
    sowing_date = Column(String(50), nullable=True)
    cultivation_season = Column(String(50), default="Kharif")  # 'Kharif', 'Rabi', 'Zaid'
    area_acres = Column(Float, default=1.0)
    polygon_geojson = Column(Text, nullable=False)  # GeoJSON string of the boundary
    centroid_lat = Column(Float, nullable=False)
    centroid_lon = Column(Float, nullable=False)
    digipin = Column(String(10), nullable=False, index=True)
    digipin_display = Column(String(20), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    farm = relationship("Farm", back_populates="fields")
    claims = relationship("Claim", back_populates="field")


class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    claim_number = Column(String(50), unique=True, index=True, nullable=False)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    field_id = Column(Integer, ForeignKey("fields.id"), nullable=False)
    disaster_type = Column(String(100), nullable=False)  # 'Flood', 'Drought', 'Heavy rainfall', 'Cyclone', 'Hailstorm', etc.
    incident_date = Column(String(50), nullable=False)
    duration_days = Column(Integer, default=1)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="submitted", index=True)
    # Statuses: draft, submitted, evidence_processing, analysis_completed, under_review, additional_evidence_required, approved, rejected, closed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    farmer = relationship("User", back_populates="claims")
    field = relationship("Field", back_populates="claims")
    evidence_list = relationship("Evidence", back_populates="claim", cascade="all, delete-orphan")
    satellite_record = relationship("SatelliteAnalysis", back_populates="claim", uselist=False, cascade="all, delete-orphan")
    weather_record = relationship("WeatherAnalysis", back_populates="claim", uselist=False, cascade="all, delete-orphan")
    assessment_record = relationship("Assessment", back_populates="claim", uselist=False, cascade="all, delete-orphan")
    report_record = relationship("Report", back_populates="claim", uselist=False, cascade="all, delete-orphan")
    reviews = relationship("ClaimReview", back_populates="claim", cascade="all, delete-orphan")


class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey("claims.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    mime_type = Column(String(50), nullable=False)
    sha256_hash = Column(String(64), nullable=False)
    exif_lat = Column(Float, nullable=True)
    exif_lon = Column(Float, nullable=True)
    exif_timestamp = Column(String(100), nullable=True)
    exif_camera = Column(String(150), nullable=True)
    distance_to_field_m = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    claim = relationship("Claim", back_populates="evidence_list")


class SatelliteAnalysis(Base):
    __tablename__ = "satellite_analysis"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey("claims.id"), unique=True, nullable=False)
    pre_disaster_date = Column(String(50), nullable=False)
    post_disaster_date = Column(String(50), nullable=False)
    pre_ndvi = Column(Float, nullable=False)
    post_ndvi = Column(Float, nullable=False)
    ndvi_delta = Column(Float, nullable=False)
    ndvi_change_pct = Column(Float, nullable=False)
    valid_pixel_pct = Column(Float, default=95.0)
    cloud_cover_pct = Column(Float, default=4.2)
    provider = Column(String(100), default="Sentinel-2 MSI (Level-2A)")
    processing_time_ms = Column(Integer, default=320)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    claim = relationship("Claim", back_populates="satellite_record")


class WeatherAnalysis(Base):
    __tablename__ = "weather_analysis"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey("claims.id"), unique=True, nullable=False)
    start_date = Column(String(50), nullable=False)
    end_date = Column(String(50), nullable=False)
    total_rainfall_mm = Column(Float, nullable=False)
    max_daily_rainfall_mm = Column(Float, nullable=False)
    historical_avg_rainfall_mm = Column(Float, nullable=False)
    rainfall_anomaly_pct = Column(Float, nullable=False)
    daily_records_json = Column(Text, nullable=False)  # JSON string of daily rainfall, temp_max, temp_min
    provider = Column(String(100), default="Open-Meteo Historical Weather API")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    claim = relationship("Claim", back_populates="weather_record")


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey("claims.id"), unique=True, nullable=False)
    finding_category = Column(String(150), nullable=False)
    # 'No significant vegetation change detected', 'Low vegetation change', 'Moderate vegetation change', 'Significant vegetation change', 'Manual verification required'
    severity_score = Column(Float, nullable=False)  # 0.0 to 100.0
    confidence_level = Column(String(50), default="High")  # 'Low', 'Medium', 'High'
    summary = Column(Text, nullable=False)
    rules_triggered_json = Column(Text, nullable=False)
    methodology_version = Column(String(50), default="v1.2-rule-based-evidence")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    claim = relationship("Claim", back_populates="assessment_record")


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey("claims.id"), unique=True, nullable=False)
    report_uuid = Column(String(64), unique=True, index=True, nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    sha256_hash = Column(String(64), nullable=False)
    verification_qr_data = Column(Text, nullable=False)
    download_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    claim = relationship("Claim", back_populates="report_record")


class ClaimReview(Base):
    __tablename__ = "claim_reviews"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey("claims.id"), nullable=False)
    officer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    decision = Column(String(50), nullable=False)  # 'approved', 'rejected', 'additional_evidence_required', 'under_review'
    remarks = Column(Text, nullable=False)
    evidence_requested = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    claim = relationship("Claim", back_populates="reviews")
    officer = relationship("User")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    link = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notifications")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(String(50), nullable=True)
    ip_address = Column(String(50), nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
