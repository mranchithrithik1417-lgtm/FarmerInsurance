import json
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.models import (
    User, FarmerProfile, OfficerProfile, Farm, Field, Claim,
    SatelliteAnalysis, WeatherAnalysis, Assessment, Evidence, AuditLog
)
from app.digipin.digipin import encode_digipin, format_digipin_display
from app.services.farm_service import parse_geometry_and_calculate_centroid

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        if db.query(User).filter(User.email == "admin@kisanclaim.gov.in").first():
            print("Database already seeded.")
            return

        print("Seeding KisanClaim database with initial accounts and demo farm data...")

        # 1. Admin
        admin = User(
            email="admin@kisanclaim.gov.in",
            hashed_password=get_password_hash("Admin@12345"),
            full_name="Dr. Sunita Sharma",
            phone="+91 98765 43210",
            role="admin"
        )
        db.add(admin)

        # 2. Officer
        officer = User(
            email="officer.mandya@kisanclaim.gov.in",
            hashed_password=get_password_hash("Officer@12345"),
            full_name="Anand Gowda, KAS",
            phone="+91 94481 22334",
            role="officer"
        )
        db.add(officer)
        db.flush()

        off_prof = OfficerProfile(
            user_id=officer.id,
            department="Karnataka State Department of Agriculture",
            designation="Assistant Director of Agriculture",
            jurisdiction_district="Mandya"
        )
        db.add(off_prof)

        # 3. Farmer
        farmer = User(
            email="farmer.ramesh@kisanclaim.gov.in",
            hashed_password=get_password_hash("Farmer@12345"),
            full_name="Ramesh Kumar H.K.",
            phone="+91 98450 11223",
            role="farmer"
        )
        db.add(farmer)
        db.flush()

        farm_prof = FarmerProfile(
            user_id=farmer.id,
            aadhar_last4="8842",
            state="Karnataka",
            district="Mandya",
            taluk="Maddur",
            village="Kestur",
            preferred_language="en"
        )
        db.add(farm_prof)

        # 4. Farm
        farm1 = Farm(
            farmer_id=farmer.id,
            name="Sri Lakshmi Agro Farm",
            state="Karnataka",
            district="Mandya",
            taluk="Maddur",
            village="Kestur",
            address="Survey No. 42/1, Kestur Village, Maddur Taluk"
        )
        db.add(farm1)
        db.flush()

        # 5. Fields with real coordinates in Mandya (~12.6°N, 77.0°E)
        # Field 1: Paddy Field
        poly1_coords = [
            [12.6012, 77.0210],
            [12.6045, 77.0212],
            [12.6042, 77.0255],
            [12.6010, 77.0250],
            [12.6012, 77.0210]
        ]
        c1_lat, c1_lon, a1, geojson1 = parse_geometry_and_calculate_centroid(json.dumps(poly1_coords))
        d1 = encode_digipin(c1_lat, c1_lon)
        field1 = Field(
            farm_id=farm1.id,
            name="North Canal Paddy Parcel",
            crop="Paddy",
            crop_variety="Jyothi (BPT-5204)",
            sowing_date="2026-07-15",
            cultivation_season="Kharif",
            area_acres=a1,
            polygon_geojson=geojson1,
            centroid_lat=c1_lat,
            centroid_lon=c1_lon,
            digipin=d1,
            digipin_display=format_digipin_display(d1)
        )
        db.add(field1)

        # Field 2: Sugarcane Field
        poly2_coords = [
            [12.5980, 77.0280],
            [12.6010, 77.0282],
            [12.6008, 77.0320],
            [12.5978, 77.0315],
            [12.5980, 77.0280]
        ]
        c2_lat, c2_lon, a2, geojson2 = parse_geometry_and_calculate_centroid(json.dumps(poly2_coords))
        d2 = encode_digipin(c2_lat, c2_lon)
        field2 = Field(
            farm_id=farm1.id,
            name="Sugarcane Block B",
            crop="Sugarcane",
            crop_variety="Co 86032 (Nayana)",
            sowing_date="2026-03-10",
            cultivation_season="Annual",
            area_acres=a2,
            polygon_geojson=geojson2,
            centroid_lat=c2_lat,
            centroid_lon=c2_lon,
            digipin=d2,
            digipin_display=format_digipin_display(d2)
        )
        db.add(field2)
        db.flush()

        # 6. Sample Claim: Heavy Inundation Damage
        claim1 = Claim(
            claim_number="CLM-2026-84920",
            farmer_id=farmer.id,
            field_id=field1.id,
            disaster_type="Flood",
            incident_date="2026-10-24",
            duration_days=4,
            description="Breach of Hemavathi canal tributary following 3 days of torrential rainfall submerged the standing paddy crop at tillering stage.",
            status="under_review"
        )
        db.add(claim1)
        db.flush()

        sat1 = SatelliteAnalysis(
            claim_id=claim1.id,
            pre_disaster_date="2026-10-18",
            post_disaster_date="2026-10-28",
            pre_ndvi=0.742,
            post_ndvi=0.368,
            ndvi_delta=-0.374,
            ndvi_change_pct=-50.4,
            valid_pixel_pct=96.5,
            cloud_cover_pct=3.2,
            provider="Sentinel-2 MSI Level-2A (ESA/Copernicus)",
            processing_time_ms=340
        )
        db.add(sat1)

        weath1 = WeatherAnalysis(
            claim_id=claim1.id,
            start_date="2026-10-17",
            end_date="2026-10-27",
            total_rainfall_mm=164.2,
            max_daily_rainfall_mm=89.5,
            historical_avg_rainfall_mm=38.0,
            rainfall_anomaly_pct=332.1,
            daily_records_json=json.dumps([
                {"date": "2026-10-21", "rainfall_mm": 12.0, "temp_max_c": 29.5, "temp_min_c": 20.8},
                {"date": "2026-10-22", "rainfall_mm": 34.5, "temp_max_c": 27.2, "temp_min_c": 20.5},
                {"date": "2026-10-23", "rainfall_mm": 89.5, "temp_max_c": 25.0, "temp_min_c": 19.8},
                {"date": "2026-10-24", "rainfall_mm": 21.2, "temp_max_c": 26.4, "temp_min_c": 20.2},
                {"date": "2026-10-25", "rainfall_mm": 7.0, "temp_max_c": 28.1, "temp_min_c": 21.0}
            ]),
            provider="Open-Meteo Historical Weather API"
        )
        db.add(weath1)

        assess1 = Assessment(
            claim_id=claim1.id,
            finding_category="Significant vegetation change",
            severity_score=82.4,
            confidence_level="High",
            summary="Multi-spectral Sentinel-2 indices confirm severe vegetation canopy collapse (-50.4% NDVI) corresponding with extreme local precipitation (+332% over 10-year climatological mean).",
            rules_triggered_json=json.dumps([
                {"rule_id": "RULE_NDVI_SEVERE_DROP", "name": "Sentinel-2 Multi-spectral Vegetation Index Deficit", "status": "CRITICAL", "details": "Significant vegetation index decline of 50.4% detected post-incident."},
                {"rule_id": "RULE_WEATHER_EXCESS_RAIN", "name": "Extreme Precipitation Corroboration", "status": "PASS", "details": "Recorded rainfall of 164.2 mm exceeds climatological normal by +332.1%."}
            ]),
            methodology_version="v1.2-rule-based-evidence"
        )
        db.add(assess1)

        db.commit()
        print("KisanClaim database seeded successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
