"""
Integration and End-to-End API Tests for KisanClaim
Verifies:
1. Health check endpoint
2. Official DIGIPIN encode & decode APIs (Dak Bhawan verification)
3. DIGIPIN 10-level hierarchy visual metadata endpoint
4. User login & JWT authentication
5. Farm creation
6. Field registration with polygon geometry, area calculation, and automatic DIGIPIN generation
7. Claim submission with satellite NDVI & weather analysis triggers
8. ReportLab PDF report generation with QR code and SHA-256 hash
9. Officer claim review and status update
10. Admin statistics endpoint
"""

import json
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import Base, engine
from database.seeds.seed_data import seed_database

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    seed_database()


def test_health_check():
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert "India Post" in data["digipin_specification"]


def test_digipin_encode_api():
    payload = {"latitude": 28.622788, "longitude": 77.213033}
    resp = client.post("/api/digipin/encode", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["digipin"] == "39J49LL8T4"
    assert data["display_format"] == "39J 49LL 8T4"


def test_digipin_decode_api():
    payload = {"digipin": "39J49LL8T4"}
    resp = client.post("/api/digipin/decode", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["valid"] is True
    assert 28.62 <= data["center_lat"] <= 28.63
    assert 77.21 <= data["center_lon"] <= 77.22


def test_digipin_hierarchy_api():
    resp = client.get("/api/digipin/hierarchy?lat=28.622788&lon=77.213033")
    assert resp.status_code == 200
    data = resp.json()
    assert data["digipin"] == "39J49LL8T4"
    assert len(data["levels"]) == 10
    # Level 1 must have 4x4 grid cells
    assert len(data["levels"][0]["grid_cells"]) == 4


def test_farmer_auth_and_workflow():
    # Login as seeded farmer
    login_resp = client.post("/api/auth/login", json={
        "email": "farmer.ramesh@kisanclaim.gov.in",
        "password": "Farmer@12345"
    })
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Verify /api/auth/me
    me_resp = client.get("/api/auth/me", headers=headers)
    assert me_resp.status_code == 200
    assert me_resp.json()["role"] == "farmer"

    # List farms
    farms_resp = client.get("/api/farms", headers=headers)
    assert farms_resp.status_code == 200
    farms = farms_resp.json()
    assert len(farms) >= 1
    farm_id = farms[0]["id"]

    # Register a new field with polygon
    poly = [
        [12.6050, 77.0220],
        [12.6080, 77.0222],
        [12.6078, 77.0260],
        [12.6048, 77.0258],
        [12.6050, 77.0220]
    ]
    field_resp = client.post("/api/fields", headers=headers, json={
        "farm_id": farm_id,
        "name": "South Wetland Parcel",
        "crop": "Sugarcane",
        "crop_variety": "Co 86032",
        "sowing_date": "2026-06-01",
        "cultivation_season": "Kharif",
        "polygon_geojson": json.dumps(poly)
    })
    assert field_resp.status_code == 200
    field_data = field_resp.json()
    assert field_data["area_acres"] > 0
    assert len(field_data["digipin"]) == 10
    field_id = field_data["id"]

    # Submit a crop damage claim
    claim_resp = client.post("/api/claims", headers=headers, json={
        "field_id": field_id,
        "disaster_type": "Flood",
        "incident_date": "2026-10-25",
        "duration_days": 3,
        "description": "Flash flooding from cloudburst damaged 2-month old sugarcane crop."
    })
    assert claim_resp.status_code == 200
    claim_data = claim_resp.json()
    assert claim_data["status"] == "submitted"
    assert claim_data["satellite"] is not None
    assert claim_data["weather"] is not None
    assert claim_data["assessment"] is not None
    claim_id = claim_data["id"]

    # Generate PDF Report
    report_resp = client.post(f"/api/claims/{claim_id}/generate-report", headers=headers)
    assert report_resp.status_code == 200
    rep_data = report_resp.json()
    assert "report_uuid" in rep_data
    assert len(rep_data["sha256_hash"]) == 64
    assert rep_data["verification_qr_data"].startswith("https://")

    # Download report
    dl_resp = client.get(rep_data["download_url"])
    assert dl_resp.status_code == 200
    assert dl_resp.headers["content-type"] == "application/pdf"
    assert len(dl_resp.content) > 1000  # valid PDF bytes


def test_officer_review_workflow():
    # Login as officer
    login_resp = client.post("/api/auth/login", json={
        "email": "officer.mandya@kisanclaim.gov.in",
        "password": "Officer@12345"
    })
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # List all claims
    claims_resp = client.get("/api/claims", headers=headers)
    assert claims_resp.status_code == 200
    claims = claims_resp.json()
    assert len(claims) >= 1
    target_claim_id = claims[0]["id"]

    # Submit review
    review_resp = client.post(f"/api/claims/{target_claim_id}/review", headers=headers, json={
        "decision": "approved",
        "remarks": "Satellite NDVI deficit (-50.4%) and rain gauge anomalies corroborate extensive inundation damage. Claim verified and cleared for processing."
    })
    assert review_resp.status_code == 200
    rev_data = review_resp.json()
    assert rev_data["decision"] == "approved"

    # Confirm updated status
    c_resp = client.get(f"/api/claims/{target_claim_id}", headers=headers)
    assert c_resp.status_code == 200
    assert c_resp.json()["status"] == "approved"


def test_admin_stats():
    login_resp = client.post("/api/auth/login", json={
        "email": "admin@kisanclaim.gov.in",
        "password": "Admin@12345"
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    stats_resp = client.get("/api/admin/stats", headers=headers)
    assert stats_resp.status_code == 200
    stats = stats_resp.json()
    assert stats["total_farmers"] >= 1
    assert stats["total_officers"] >= 1
    assert stats["total_claims"] >= 1
    assert stats["digipin_engine_status"].startswith("Online")
