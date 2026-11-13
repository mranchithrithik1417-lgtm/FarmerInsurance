"""
Unit Tests for Official India Post DIGIPIN Algorithm
Verifies:
1. Mandatory Dak Bhawan reference test (28.622788, 77.213033 -> 39J49LL8T4)
2. Character alphabet and length constraints
3. Decoding accuracy and bounding box containment
4. Boundary condition rules (top-most, right-most, grid lines)
5. Out-of-bounds coordinate rejection
6. 10-level hierarchy visual metadata generation
"""

import pytest
from app.digipin.digipin import (
    encode_digipin,
    decode_digipin,
    format_digipin_display,
    get_digipin_hierarchy,
    BOUNDS,
    PERMITTED_CHARS
)


def test_dak_bhawan_reference():
    """Mandatory official India Post reference test."""
    lat = 28.622788
    lon = 77.213033
    digipin = encode_digipin(lat, lon)
    assert digipin == "39J49LL8T4", f"Expected 39J49LL8T4, got {digipin}"
    assert format_digipin_display(digipin) == "39J 49LL 8T4"


def test_permitted_characters_and_length():
    """Test that all characters in generated DIGIPIN are from the official 16-character alphabet."""
    # Test coordinates across India (Bengaluru, Mumbai, Kolkata, Chennai, Srinagar)
    test_coords = [
        (12.9716, 77.5946),  # Bengaluru
        (19.0760, 72.8777),  # Mumbai
        (22.5726, 88.3639),  # Kolkata
        (13.0827, 80.2707),  # Chennai
        (34.0837, 74.7973),  # Srinagar
    ]
    for lat, lon in test_coords:
        code = encode_digipin(lat, lon)
        assert len(code) == 10
        for ch in code:
            assert ch in PERMITTED_CHARS, f"Character {ch} not permitted in DIGIPIN"


def test_decoding_center_and_containment():
    """Test that decoded center coordinate lies inside cell bounds and is close to original coordinate."""
    lat = 28.622788
    lon = 77.213033
    code = "39J49LL8T4"
    decoded = decode_digipin(code)
    
    assert decoded["valid"] is True
    assert decoded["digipin"] == code
    assert decoded["display_format"] == "39J 49LL 8T4"
    
    # Original point must be within cell bounds
    assert decoded["min_lat"] <= lat <= decoded["max_lat"]
    assert decoded["min_lon"] <= lon <= decoded["max_lon"]
    
    # Decoded center must be within cell bounds
    assert decoded["min_lat"] <= decoded["center_lat"] <= decoded["max_lat"]
    assert decoded["min_lon"] <= decoded["center_lon"] <= decoded["max_lon"]
    
    # Cell size at level 10 must be approx 3.8m
    assert 2.0 <= decoded["cell_height_m_approx"] <= 5.0
    assert 2.0 <= decoded["cell_width_m_approx"] <= 5.0


def test_out_of_bounds_rejection():
    """Test that coordinates outside official EPSG:4326 India Post bounding box raise ValueError."""
    # Outside latitude
    with pytest.raises(ValueError):
        encode_digipin(1.0, 77.0)  # Below 2.5 N
    with pytest.raises(ValueError):
        encode_digipin(40.0, 77.0)  # Above 38.5 N
    
    # Outside longitude
    with pytest.raises(ValueError):
        encode_digipin(20.0, 60.0)  # West of 63.5 E
    with pytest.raises(ValueError):
        encode_digipin(20.0, 102.0)  # East of 99.5 E


def test_invalid_decode_inputs():
    """Test decoding with invalid length or illegal characters."""
    with pytest.raises(ValueError):
        decode_digipin("39J49")  # Too short
    with pytest.raises(ValueError):
        decode_digipin("39J49LL8T4Extra")  # Too long
    with pytest.raises(ValueError):
        decode_digipin("39J49LL8X4")  # 'X' is forbidden beta character
    with pytest.raises(ValueError):
        decode_digipin("39J49LL8G4")  # 'G' is forbidden beta character


def test_boundary_handling_edges():
    """Test boundary points at extreme limits and grid boundaries."""
    # Top-most boundary: 38.5 N
    code_top = encode_digipin(38.5, 77.0)
    assert len(code_top) == 10
    
    # Right-most boundary: 99.5 E
    code_right = encode_digipin(20.0, 99.5)
    assert len(code_right) == 10
    
    # Bottom-left corner: (2.5 N, 63.5 E)
    code_corner = encode_digipin(2.5, 63.5)
    assert len(code_corner) == 10


def test_hierarchy_generator():
    """Test that 10-level hierarchy contains complete visual details for all levels."""
    lat = 28.622788
    lon = 77.213033
    hierarchy = get_digipin_hierarchy(lat, lon)
    
    assert hierarchy["digipin"] == "39J49LL8T4"
    assert len(hierarchy["levels"]) == 10
    
    expected_sequence = ["3", "9", "J", "4", "9", "L", "L", "8", "T", "4"]
    for i, step in enumerate(hierarchy["levels"]):
        assert step["level"] == i + 1
        assert step["char"] == expected_sequence[i]
        assert len(step["grid_cells"]) == 4
        assert len(step["grid_cells"][0]) == 4
        assert step["accumulated_prefix"] == "".join(expected_sequence[:i+1])
