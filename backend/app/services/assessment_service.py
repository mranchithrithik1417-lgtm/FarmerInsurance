import json
from typing import Dict, Any, List

def evaluate_claim_assessment(
    claim_id: int,
    disaster_type: str,
    ndvi_data: Dict[str, Any],
    weather_data: Dict[str, Any],
    evidence_list: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Transparent, rule-based preliminary damage assessment engine.
    Produces evidence-based findings without asserting legally binding claim guarantees.
    """
    rules_triggered: List[Dict[str, Any]] = []
    ndvi_drop_pct = abs(ndvi_data.get("ndvi_change_pct", 0.0))
    rainfall_anomaly_pct = weather_data.get("rainfall_anomaly_pct", 0.0)
    total_rainfall = weather_data.get("total_rainfall_mm", 0.0)

    # Check photographic evidence GPS proximity
    photos_with_gps = [e for e in evidence_list if e.get("exif_lat") is not None]
    has_photo_evidence = len(evidence_list) > 0
    gps_match = False
    max_dist_m = 0.0

    if photos_with_gps:
        distances = [e.get("distance_to_field_m", 0.0) or 0.0 for e in photos_with_gps]
        max_dist_m = max(distances)
        if max_dist_m <= 1500.0:
            gps_match = True
            rules_triggered.append({
                "rule_id": "RULE_EXIF_PROXIMITY_PASS",
                "name": "Ground Photo Coordinate Verification",
                "status": "PASS",
                "details": f"Farmer photograph GPS metadata matches registered field within {int(max_dist_m)} meters."
            })
        else:
            rules_triggered.append({
                "rule_id": "RULE_EXIF_PROXIMITY_FLAG",
                "name": "Ground Photo Coordinate Offset",
                "status": "WARNING",
                "details": f"Photograph capture location is {int(max_dist_m)}m away from registered field centroid. Manual inspection recommended."
            })
    elif has_photo_evidence:
        rules_triggered.append({
            "rule_id": "RULE_EXIF_NO_GPS",
            "name": "Ground Photograph Submitted (No EXIF GPS)",
            "status": "INFO",
            "details": "Photo evidence received without embedded EXIF coordinates. Allowed under standard low-connectivity protocol."
        })
    else:
        rules_triggered.append({
            "rule_id": "RULE_NO_EVIDENCE",
            "name": "Missing Ground Evidence",
            "status": "FAIL",
            "details": "No ground damage photographs provided with claim."
        })

    # Evaluate Satellite NDVI drop
    if ndvi_drop_pct >= 28.0:
        rules_triggered.append({
            "rule_id": "RULE_NDVI_SEVERE_DROP",
            "name": "Sentinel-2 Multi-spectral Vegetation Index Deficit",
            "status": "CRITICAL",
            "details": f"Significant vegetation index decline of {ndvi_drop_pct:.1f}% detected post-incident (Pre-NDVI: {ndvi_data.get('pre_ndvi')} -> Post-NDVI: {ndvi_data.get('post_ndvi')})."
        })
    elif ndvi_drop_pct >= 14.0:
        rules_triggered.append({
            "rule_id": "RULE_NDVI_MODERATE_DROP",
            "name": "Moderate Vegetation Index Reduction",
            "status": "WARNING",
            "details": f"Moderate vegetation index decline of {ndvi_drop_pct:.1f}% detected post-incident."
        })
    else:
        rules_triggered.append({
            "rule_id": "RULE_NDVI_LOW_DROP",
            "name": "Marginal Vegetation Index Deviation",
            "status": "NEUTRAL",
            "details": f"Vegetation index difference is within baseline variance ({ndvi_drop_pct:.1f}%)."
        })

    # Evaluate Weather Anomalies
    disaster_lower = disaster_type.lower()
    if "flood" in disaster_lower or "rain" in disaster_lower or "cyclone" in disaster_lower:
        if rainfall_anomaly_pct > 60.0 or total_rainfall > 100.0:
            rules_triggered.append({
                "rule_id": "RULE_WEATHER_EXCESS_RAIN",
                "name": "Extreme Precipitation Corroboration",
                "status": "PASS",
                "details": f"Recorded rainfall of {total_rainfall:.1f} mm exceeds climatological normal by +{rainfall_anomaly_pct:.1f}%."
            })
        else:
            rules_triggered.append({
                "rule_id": "RULE_WEATHER_RAIN_INSUFFICIENT",
                "name": "Precipitation Corroboration Inconclusive",
                "status": "INFO",
                "details": f"Recorded rainfall ({total_rainfall:.1f} mm) does not show extreme statistical anomaly."
            })
    elif "drought" in disaster_lower:
        if total_rainfall < 10.0:
            rules_triggered.append({
                "rule_id": "RULE_WEATHER_DROUGHT_CORROBORATION",
                "name": "Deficit Rainfall Corroboration",
                "status": "PASS",
                "details": f"Extreme precipitation deficit of {rainfall_anomaly_pct:.1f}% recorded over the monitoring period."
            })

    # Final Categorization and Scoring
    severity_score = 0.0
    confidence_level = "High"

    if ndvi_drop_pct >= 28.0 and (rainfall_anomaly_pct > 40.0 or "hail" in disaster_lower):
        finding_category = "Significant vegetation change"
        severity_score = min(92.0, 50.0 + ndvi_drop_pct * 0.9)
        summary = (
            f"Preliminary multi-source evidence corroborates significant crop vegetation disturbance. "
            f"Sentinel-2 remote sensing demonstrates a {ndvi_drop_pct:.1f}% reduction in chlorophyll absorption, "
            f"coinciding with extreme weather anomalies and farmer-submitted photo evidence."
        )
    elif ndvi_drop_pct >= 14.0:
        finding_category = "Moderate vegetation change"
        severity_score = 40.0 + ndvi_drop_pct * 0.8
        summary = (
            f"Moderate vegetation stress detected. Satellite analysis shows a {ndvi_drop_pct:.1f}% NDVI drop. "
            f"Local field inspection by an assigned agricultural officer is advised to quantify physical loss."
        )
    elif max_dist_m > 3000.0:
        finding_category = "Manual verification required"
        severity_score = 35.0
        confidence_level = "Medium"
        summary = (
            f"Spatial metadata discrepancy detected: submitted photo coordinates are situated over 3 km "
            f"from the registered DIGIPIN field boundary. Manual officer audit is required."
        )
    elif ndvi_drop_pct >= 6.0:
        finding_category = "Low vegetation change"
        severity_score = 20.0 + ndvi_drop_pct
        summary = (
            f"Vegetation indices indicate minor localized variance ({ndvi_drop_pct:.1f}% change). "
            f"Observations remain within typical agronomic seasonal boundaries."
        )
    else:
        finding_category = "No significant vegetation change detected"
        severity_score = 10.0
        summary = (
            f"Multi-spectral imagery shows stable canopy reflectance across the disaster window. "
            f"No notable vegetation drop observed."
        )

    return {
        "finding_category": finding_category,
        "severity_score": round(severity_score, 1),
        "confidence_level": confidence_level,
        "summary": summary,
        "rules_triggered": rules_triggered,
        "methodology_version": "v1.2-rule-based-evidence"
    }
