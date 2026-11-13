/**
 * KisanClaim Complete Bilingual Translations (English & Kannada)
 * Covers all farmer dashboards, insurer consoles, geospatial twin,
 * ULPIN recovery, multi-agent panels, camera, and adjudication.
 */

export type Language = 'en' | 'kn';

export interface TranslationDictionary {
  [key: string]: {
    en: string;
    kn: string;
  };
}

export const translations: TranslationDictionary = {
  // Brand & Common
  app_name: { en: 'KisanClaim', kn: 'ಕಿಸಾನ್‌ಕ್ಲೇಮ್' },
  app_tagline: { 
    en: 'PMFBY AI Crop Damage Evidence Intelligence & Claim Verification Platform', 
    kn: 'ಪಿಎಂಎಫ್‌ಬಿವೈ ಎಐ ಬೆಳೆ ಹಾನಿ ಪುರಾವೆ ಗುಪ್ತಚರ ಮತ್ತು ವಿಮಾ ಕ್ಲೇಮ್ ಪರಿಶೀಲನಾ ವೇದಿಕೆ' 
  },
  gov_badge: { 
    en: 'Govt. of India PMFBY Initiative • Bhoomi Karnataka', 
    kn: 'ಭಾರತ ಸರ್ಕಾರ ಪಿಎಂಎಫ್‌ಬಿವೈ ಉಪಕ್ರಮ • ಭೂಮಿ ಕರ್ನಾಟಕ' 
  },
  support_helpline: { en: 'Helpline: 9019715931', kn: 'ಸಹಾಯವಾಣಿ: 9019715931' },
  support_call: { en: 'Call 9019715931', kn: 'ಕರೆ ಮಾಡಿ: 9019715931' },
  help_faqs: { en: 'Help & FAQs', kn: 'ಸಹಾಯ & ಪ್ರಶ್ನೋತ್ತರಗಳು' },
  switch_to_insurer: { en: 'Switch to Insurer', kn: 'ವಿಮಾ ಕನ್ಸೋಲ್‌ಗೆ ಬದಲಾಯಿಸಿ' },
  switch_to_farmer: { en: 'Switch to Farmer', kn: 'ರೈತರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಬದಲಾಯಿಸಿ' },
  active_farmer_portal: { en: 'Farmer Portal (Active)', kn: 'ರೈತರ ಪೋರ್ಟಲ್ (ಸಕ್ರಿಯ)' },
  active_insurer_portal: { en: 'Insurance Console (Active)', kn: 'ವಿಮಾ ಕನ್ಸೋಲ್ (ಸಕ್ರಿಯ)' },
  sign_out: { en: 'Sign Out', kn: 'ನಿರ್ಗಮಿಸಿ (ಲಾಗ್‌ಔಟ್)' },
  notifications: { en: 'Notifications', kn: 'ಅಧಿಸೂಚನೆಗಳು' },
  no_notifications: { en: 'No unread notifications', kn: 'ಯಾವುದೇ ಹೊಸ ಅಧಿಸೂಚನೆಗಳಿಲ್ಲ' },
  back: { en: 'Back', kn: 'ಹಿಂದೆ' },
  cancel: { en: 'Cancel', kn: 'ರದ್ದುಗೊಳಿಸಿ' },
  continue: { en: 'Continue', kn: 'ಮುಂದುವರಿಯಿರಿ' },
  submit: { en: 'Submit', kn: 'ಸಲ್ಲಿಸಿ' },
  skip: { en: 'Skip', kn: 'ಬಿಟ್ಟುಬಿಡಿ' },
  loading: { en: 'Loading...', kn: 'ದಯವಿಟ್ಟು ನಿರೀಕ್ಷಿಸಿ...' },
  save: { en: 'Save', kn: 'ಉಳಿಸಿ' },
  verified: { en: 'Verified', kn: 'ದೃಢೀಕರಿಸಲಾಗಿದೆ' },
  acres: { en: 'Acres', kn: 'ಎಕರೆ' },

  // Farmer ULPIN Dashboard
  ulpin_hero_title: { en: 'Identify Your Agricultural Land', kn: 'ನಿಮ್ಮ ಕೃಷಿ ಭೂಮಿಯನ್ನು ಗುರುತಿಸಿ' },
  ulpin_welcome_prefix: { en: 'Welcome to KisanClaim', kn: 'ಕಿಸಾನ್‌ಕ್ಲೇಮ್‌ಗೆ ಸ್ವಾಗತ' },
  ulpin_hero_desc: {
    en: 'Every agricultural land parcel in India is assigned a 14-digit geospatial Unique Land Parcel Identification Number (ULPIN / Bhu-Aadhaar). Connecting your ULPIN auto-links cadastral boundaries, DIGIPIN coordinates, and Sentinel-2 satellite evidence.',
    kn: 'ಭಾರತದ ಪ್ರತಿಯೊಂದು ಕೃಷಿ ಭೂಮಿಗೆ 14-ಅಂಕಿಯ ಭೂ-ಆಧಾರ್ / ULPIN (ವಿಶಿಷ್ಟ ಭೂಮಿ ಗುರುತಿನ ಸಂಖ್ಯೆ) ನೀಡಲಾಗಿದೆ. ನಿಮ್ಮ ULPIN ಸಂಪರ್ಕಿಸುವುದರಿಂದ ಭೂಮಿಯ ಗಡಿಗಳು, ಡಿಜಿಪಿನ್ ಮತ್ತು ಸೆಂಟಿನೆಲ್-2 ಉಪಗ್ರಹ ಸಾಕ್ಷ್ಯಗಳು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಲಿಂಕ್ ಆಗುತ್ತವೆ.'
  },
  view_my_claims: { en: 'View My Existing Claims', kn: 'ನನ್ನ ಹಿಂದಿನ ಕ್ಲೇಮ್‌ಗಳನ್ನು ವೀಕ್ಷಿಸಿ' },
  
  // Option 1: I Know My ULPIN
  opt1_title: { en: 'I Know My ULPIN', kn: 'ನನ್ನ ULPIN ತಿಳಿದಿದೆ' },
  opt1_desc: { 
    en: 'Enter your 14-character land parcel ULPIN (Bhu-Aadhaar) to fetch land records and proceed directly to crop damage assessment.', 
    kn: 'ಬೆಳೆ ಹಾನಿ ಮೌಲ್ಯಮಾಪನ ಮುಂದುವರಿಸಲು ನಿಮ್ಮ 14-ಅಕ್ಷರಗಳ ಜಮೀನಿನ ULPIN (ಭೂ-ಆಧಾರ್) ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.' 
  },
  opt1_label: { en: '14-Character Land ULPIN', kn: '14-ಅಕ್ಷರಗಳ ಜಮೀನಿನ ULPIN ಸಂಖ್ಯೆ' },
  opt1_placeholder: { en: 'e.g. 29BLR125200102', kn: 'ಉದಾ: 29BLR125200102' },
  opt1_verify_btn: { en: 'Verify ULPIN & Continue', kn: 'ULPIN ಪರಿಶೀಲಿಸಿ & ಮುಂದುವರಿಯಿರಿ' },
  opt1_verifying: { en: 'Validating against Bhoomi...', kn: 'ಭೂಮಿ ದಾಖಲೆಗಳಲ್ಲಿ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...' },
  opt1_quick_fill: { en: 'Or select a demo parcel:', kn: 'ಅಥವಾ ಡೆಮೊ ಜಮೀನು ಆಯ್ಕೆಮಾಡಿ:' },
  opt1_land_found: { en: 'Land Parcel Verified & Confirmed', kn: 'ಜಮೀನಿನ ವಿವರ ದೃಢೀಕರಿಸಲಾಗಿದೆ' },
  opt1_proceed_btn: { en: 'Confirm & Proceed to Crop Damage Assessment', kn: 'ಖಚಿತಪಡಿಸಿ & ಬೆಳೆ ಹಾನಿ ಮೌಲ್ಯಮಾಪನಕ್ಕೆ ತೆರಳಿ' },

  // Option 2: Forgot My ULPIN
  opt2_title: { en: 'Forgot My ULPIN', kn: 'ULPIN ಮರೆತಿದೆ' },
  opt2_desc: { 
    en: "Don't know your ULPIN? Retrieve it instantly using your name, district, taluk, village, and survey number.", 
    kn: 'ನಿಮ್ಮ ULPIN ತಿಳಿದಿಲ್ಲವೇ? ನಿಮ್ಮ ಹೆಸರು, ಜಿಲ್ಲೆ, ತಾಲೂಕು, ಗ್ರಾಮ ಮತ್ತು ಸರ್ವೆ ಸಂಖ್ಯೆಯನ್ನು ಬಳಸಿ ತಕ್ಷಣ ಹುಡುಕಿ.' 
  },
  opt2_btn: { en: 'Retrieve ULPIN via Bhoomi', kn: 'ಭೂಮಿ ಮೂಲಕ ULPIN ಹುಡುಕಿ' },

  // Forgot ULPIN Dashboard
  forgot_heading: { en: 'Recover Your ULPIN', kn: 'ನಿಮ್ಮ ULPIN ಮರುಪಡೆಯಿರಿ' },
  forgot_subheading: { 
    en: 'Enter your personal and agricultural land details to retrieve your ULPIN from Bhoomi Karnataka records.', 
    kn: 'ಭೂಮಿ ಕರ್ನಾಟಕ ದಾಖಲೆಗಳಿಂದ ನಿಮ್ಮ ULPIN ಪಡೆಯಲು ವೈಯಕ್ತಿಕ ಮತ್ತು ಜಮೀನಿನ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ.' 
  },
  field_full_name: { en: "Farmer's Full Name (Mandatory)", kn: 'ರೈತರ ಪೂರ್ಣ ಹೆಸರು (ಕಡ್ಡಾಯ)' },
  field_district: { en: 'District (Mandatory)', kn: 'ಜಿಲ್ಲೆ (ಕಡ್ಡಾಯ)' },
  field_taluk: { en: 'Taluk (Mandatory)', kn: 'ತಾಲೂಕು (ಕಡ್ಡಾಯ)' },
  field_village: { en: 'Village (Mandatory)', kn: 'ಗ್ರಾಮ / ಊರು (ಕಡ್ಡಾಯ)' },
  field_survey_no: { en: 'Survey Number (Optional)', kn: 'ಸರ್ವೆ ಸಂಖ್ಯೆ (ಐಚ್ಛಿಕ)' },
  btn_fetch_ulpin: { en: 'Fetch ULPIN Records', kn: 'ULPIN ಹುಡುಕಿ' },
  btn_fetching: { en: 'Querying Bhoomi Cadastral Portal...', kn: 'ಭೂಮಿ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಹುಡುಕಲಾಗುತ್ತಿದೆ...' },
  btn_back_dashboard: { en: 'Back to Dashboard', kn: 'ಹಿಂದಿನ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ' },
  quick_presets: { en: 'Quick Test Presets:', kn: 'ಪೂರ್ವಸಿದ್ಧ ಮಾದರಿ ವಿವರಗಳು:' },
  results_found_title: { en: 'Matching Land Parcels Found', kn: 'ಹೊಂದಿಕೆಯಾಗುವ ಜಮೀನುಗಳು ದೊರೆತಿವೆ' },
  select_parcel_prompt: { 
    en: 'Multiple cadastral records match your query. Select your correct land parcel below:', 
    kn: 'ನಿಮ್ಮ ವಿವರಗಳಿಗೆ ಹೊಂದಿಕೆಯಾಗುವ ದಾಖಲೆಗಳು ದೊರೆತಿವೆ. ನಿಮ್ಮ ಸರಿಯಾದ ಜಮೀನನ್ನು ಆಯ್ಕೆಮಾಡಿ:' 
  },
  ulpin_retrieved_success: { en: 'ULPIN Retrieved Successfully!', kn: 'ULPIN ಯಶಸ್ವಿಯಾಗಿ ದೊರೆತಿದೆ!' },
  copy_ulpin: { en: 'Copy ULPIN', kn: 'ULPIN ನಕಲಿಸಿ' },
  copied: { en: 'Copied!', kn: 'ನಕಲಿಸಲಾಗಿದೆ!' },
  btn_continue_assessment: { en: 'Continue to Crop Assessment', kn: 'ಬೆಳೆ ಹಾನಿ ಮೌಲ್ಯಮಾಪನಕ್ಕೆ ಮುಂದುವರಿಯಿರಿ' },
  owner_name: { en: 'Registered Owner', kn: 'ನೋಂದಾಯಿತ ಮಾಲೀಕರು' },
  survey_label: { en: 'Survey #', kn: 'ಸರ್ವೆ ಸಂ.' },
  land_area: { en: 'Land Extent', kn: 'ಜಮೀನಿನ ವಿಸ್ತೀರ್ಣ' },
  no_record_found: { en: 'No matching land record found. Please verify your details.', kn: 'ಯಾವುದೇ ಹೊಂದಾಣಿಕೆಯ ದಾಖಲೆ ಕಂಡುಬಂದಿಲ್ಲ. ದಯವಿಟ್ಟು ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.' },

  // Farmer Dashboard Navigation & Dossier
  tab_identify_land: { en: 'Identify Land (ULPIN)', kn: 'ಜಮೀನು ಗುರುತಿಸುವಿಕೆ (ULPIN)' },
  tab_active_dossier: { en: 'Active Claim Dossier & Evidence Twin', kn: 'ಸಕ್ರಿಯ ಕ್ಲೇಮ್ ದಾಖಲೆ & ಉಪಗ್ರಹ ಪುರಾವೆ' },
  btn_launch_assistant: { en: 'Launch AI Voice Assistant', kn: 'ಎಐ ಧ್ವನಿ ಸಹಾಯಕ ಪ್ರಾರಂಭಿಸಿ' },
  btn_pdf_report: { en: 'Official PMFBY PDF Report', kn: 'ಅಧಿಕೃತ PMFBY ಪಿಡಿಎಫ್ ವರದಿ' },
  claim_overview_title: { en: 'PMFBY Active Claim Dossier', kn: 'ಪಿಎಂಎಫ್‌ಬಿವೈ ಸಕ್ರಿಯ ಕ್ಲೇಮ್ ಕಡತ' },
  claim_number_label: { en: 'Claim #', kn: 'ಕ್ಲೇಮ್ ಸಂಖ್ಯೆ' },
  crop_affected: { en: 'Crop Affected', kn: 'ಹಾನಿಗೊಳಗಾದ ಬೆಳೆ' },
  disaster_type: { en: 'Disaster Cause', kn: 'ವಿಕೋಪದ ಕಾರಣ' },
  reported_damage: { en: 'Reported Loss', kn: 'ವರದಿ ಮಾಡಿದ ನಷ್ಟ' },
  ai_verified_loss: { en: 'AI Verified Loss', kn: 'ಎಐ ದೃಢೀಕರಿಸಿದ ನಷ್ಟ' },
  estimated_compensation: { en: 'Estimated Payout', kn: 'ಅಂದಾಜು ಪರಿಹಾರ ಮೊತ್ತ' },
  claim_status: { en: 'Status', kn: 'ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ' },
  status_submitted: { en: 'Claim Submitted', kn: 'ಕ್ಲೇಮ್ ಸಲ್ಲಿಸಲಾಗಿದೆ' },
  status_under_review: { en: 'Satellite & Swarm Verification', kn: 'ಉಪಗ್ರಹ ಮತ್ತು ಎಐ ಪರಿಶೀಲನೆ' },
  status_approved: { en: 'Approved for Fast-Track DBT', kn: 'ಡಿಬಿಟಿ ಪಾವತಿಗೆ ಅನುಮೋದಿಸಲಾಗಿದೆ' },
  status_rejected: { en: 'Claim Rejected', kn: 'ಕ್ಲೇಮ್ ತಿರಸ್ಕರಿಸಲಾಗಿದೆ' },
  status_flagged: { en: 'Flagged for Inspection', kn: 'ತಪಾಸಣೆಗೆ ಗುರುತಿಸಲಾಗಿದೆ' },
  reviewer_remarks: { en: 'Official Reviewer & Agronomist Remarks', kn: 'ಅಧಿಕೃತ ವಿಮರ್ಶಕರು ಮತ್ತು ಕೃಷಿ ತಜ್ಞರ ಟಿಪ್ಪಣಿ' },

  // Geospatial Twin Viewer
  twin_header: { en: 'Geospatial Evidence Twin', kn: 'ಭೌಗೋಳಿಕ ಪುರಾವೆ ಅವಳಿ (Geospatial Twin)' },
  btn_fetch_satellite: { en: 'Fetch Live Satellite Scene', kn: 'ಲೈವ್ ಉಪಗ್ರಹ ದೃಶ್ಯ ಪಡೆಯಿರಿ' },
  btn_earth_3d: { en: 'Open in Google Earth 3D', kn: 'ಗೂಗಲ್ ಅರ್ಥ್ 3D ಯಲ್ಲಿ ವೀಕ್ಷಿಸಿ' },
  mode_satellite_boundary: { en: 'Satellite & Marked Plot Boundary', kn: 'ಉಪಗ್ರಹ ಚಿತ್ರ & ಜಮೀನಿನ ಗಡಿ' },
  mode_slider: { en: 'Sentinel-2 Pre/Post Slider', kn: 'ಸೆಂಟಿನೆಲ್-2 ಮುನ್ನ/ನಂತರದ ಸ್ಲೈಡರ್' },
  mode_ndvi: { en: 'NDVI Spatial Heatmap', kn: 'NDVI ಸಸ್ಯವರ್ಗ ನಕ್ಷೆ' },
  mode_flood: { en: 'Inundation Mask', kn: 'ಪ್ರವಾಹ ಮುಳುಗಡೆ ಮುಸುಕು' },
  kpi_pre_ndvi: { en: 'Pre-Disaster NDVI', kn: 'ವಿಪತ್ತಿಗೆ ಮುಂಚಿನ NDVI' },
  kpi_post_ndvi: { en: 'Post-Disaster NDVI', kn: 'ವಿಪತ್ತಿನ ನಂತರದ NDVI' },
  kpi_drop_ndvi: { en: 'Net Vegetation Drop', kn: 'ನಿವ್ವಳ ಸಸ್ಯವರ್ಗ ನಷ್ಟ' },
  kpi_ndwi: { en: 'NDWI Water Index', kn: 'NDWI ನೀರಿನ ಮಟ್ಟ' },
  audit_toggle_title: { en: 'Marked Land Plot Boundary & DIGIPIN Square Match Verification Audit', kn: 'ಜಮೀನಿನ ಗಡಿ ಮತ್ತು ಡಿಜಿಪಿನ್ ಪರಿಶೀಲನಾ ಲೆಕ್ಕಪರಿಶೋಧನೆ' },
  audit_gis_match: { en: '100% GIS Ground Match', kn: '೧೦೦% ಜಿಐಎಸ್ ಭೂಮಿ ಹೊಂದಾಣಿಕೆ' },
  audit_corner: { en: 'Corner', kn: 'ಮೂಲೆ' },
  audit_perimeter: { en: 'Total Perimeter', kn: 'ಒಟ್ಟು ಸುತ್ತಳತೆ' },

  // Land Plot Map Selector
  map_selector_title: { en: 'Live Satellite Plot Boundary Selector', kn: 'ಲೈವ್ ಉಪಗ್ರಹ ಜಮೀನು ಗಡಿ ಆಯ್ಕೆಗಾರ' },
  map_selector_desc: { en: 'Drag green pins (P1–P4) directly onto your real farm parcel visible from space.', kn: 'ಬಾಹ್ಯಾಕಾಶದಿಂದ ಕಾಣುವ ನಿಮ್ಮ ನೈಜ ಜಮೀನಿನ ಬದುಗಳ ಮೇಲೆ ಹಸಿರು ಪಿನ್‌ಗಳನ್ನು (P1–P4) ಎಳೆಯಿರಿ.' },
  btn_add_corner: { en: 'Add Corner', kn: 'ಮೂಲೆ ಸೇರಿಸಿ' },
  btn_recenter: { en: 'Recenter', kn: 'ಮರುಕೇಂದ್ರೀಕರಿಸಿ' },
  btn_reset: { en: 'Reset', kn: 'ಮರುಹೊಂದಿಸಿ' },
  opt_drag_map: { en: 'Option 1: Drag on Satellite Map (Recommended)', kn: 'ಆಯ್ಕೆ 1: ಉಪಗ್ರಹ ನಕ್ಷೆಯಲ್ಲಿ ಬದುಗಳನ್ನು ಎಳೆಯಿರಿ (ಶಿಫಾರಸು)' },
  opt_autofetch_gps: { en: 'Option 2: Auto-Fetch GPS', kn: 'ಆಯ್ಕೆ 2: ಜಿಪಿಎಸ್ ಸ್ವಯಂ ಪಡೆಯಿರಿ' },
  opt_manual_coords: { en: 'Option 3: Enter Lat/Long', kn: 'ಆಯ್ಕೆ 3: ಅಕ್ಷಾಂಶ/ರೇಖಾಂಶ ನಮೂದಿಸಿ' },
  autofetch_btn: { en: 'Auto-Fetch Location Now', kn: 'ಈಗಲೇ ಜಿಪಿಎಸ್ ಲಾಕ್ ಮಾಡಿ' },
  marked_area: { en: 'Marked Land Area', kn: 'ಗುರುತಿಸಿದ ವಿಸ್ತೀರ್ಣ' },
  perimeter_bunds: { en: 'Perimeter Bunds', kn: 'ಸುತ್ತಳತೆ ಬದುಗಳು' },
  national_digipin: { en: 'National DIGIPIN', kn: 'ರಾಷ್ಟ್ರೀಯ ಡಿಜಿಪಿನ್' },

  // Voice & Guided Assessment Modal
  assistant_title: { en: 'KisanClaim Assessment Assistant', kn: 'ಕಿಸಾನ್‌ಕ್ಲೇಮ್ ಹಾನಿ ಮೌಲ್ಯಮಾಪನ ಸಹಾಯಕ' },
  ai_guided_mode: { en: 'AI GUIDED MODE', kn: 'ಎಐ ಮಾರ್ಗದರ್ಶನ ಮೋಡ್' },
  step_counter: { en: 'Step', kn: 'ಹಂತ' },
  of: { en: 'of', kn: 'ರ' },
  btn_listen: { en: 'Listen', kn: 'ಕೇಳಿ' },
  btn_speaking: { en: 'Speaking...', kn: 'ಮಾತನಾಡುತ್ತಿದೆ...' },
  btn_speak_answer: { en: 'Speak Answer', kn: 'ಧ್ವನಿ ಮೂಲಕ ಉತ್ತರಿಸಿ' },
  btn_listening: { en: 'Listening... (Click to Stop)', kn: 'ಆಲಿಸುತ್ತಿದೆ... (ನಿಲ್ಲಿಸಲು ಒತ್ತಿರಿ)' },
  quick_voice_answers: { en: 'Quick Voice Answers:', kn: 'ತ್ವರಿತ ಧ್ವನಿ ಮಾದರಿ ಉತ್ತರಗಳು:' },
  btn_submit_and_analyze: { en: 'Submit Claim & Analyze', kn: 'ಕ್ಲೇಮ್ ಸಲ್ಲಿಸಿ & ವಿಶ್ಲೇಷಿಸಿ' },

  // Steps in Assessment
  step1_heading: { en: 'Step 1 — Land Identification & GPS Satellite Map', kn: 'ಹಂತ 1 — ಭೂಮಿ ಗುರುತಿಸುವಿಕೆ & ಜಿಪಿಎಸ್ ಉಪಗ್ರಹ ನಕ್ಷೆ' },
  step2_heading: { en: 'Step 2 — Crop Details', kn: 'ಹಂತ 2 — ಬೆಳೆ ವಿವರಗಳು' },
  step3_heading: { en: 'Step 3 — Disaster Occurrence & Severity', kn: 'ಹಂತ 3 — ನೈಸರ್ಗಿಕ ವಿಕೋಪ ಮತ್ತು ಹಾನಿಯ ಪ್ರಮಾಣ' },
  step4_heading: { en: 'Step 4 — Financial Loss Estimation', kn: 'ಹಂತ 4 — ಆರ್ಥಿಕ ನಷ್ಟದ ಅಂದಾಜು' },
  step5_heading: { en: 'Step 5 — Photographic Evidence with Geo-Tags', kn: 'ಹಂತ 5 — ಜಿಯೋಟ್ಯಾಗ್ ಹೊಂದಿದ ಛಾಯಾಚಿತ್ರ ಸಾಕ್ಷ್ಯಗಳು' },
  crop_sown_label: { en: 'Crop Sown', kn: 'ಬಿತ್ತನೆ ಮಾಡಿದ ಬೆಳೆ' },
  sowing_date_label: { en: 'Approximate Sowing Date', kn: 'ಅಂದಾಜು ಬಿತ್ತನೆ ದಿನಾಂಕ' },
  insured_area_label: { en: 'Policy Insured Area (Acres)', kn: 'ವಿಮೆ ಮಾಡಿಸಿದ ವಿಸ್ತೀರ್ಣ (ಎಕರೆ)' },
  policy_app_label: { en: 'PMFBY Policy Application Number', kn: 'ಪಿಎಂಎಫ್‌ಬಿವೈ ವಿಮಾ ಅರ್ಜಿ ಸಂಖ್ಯೆ' },
  sum_insured_cap: { en: 'Maximum Sum Insured Cap', kn: 'ಗರಿಷ್ಠ ವಿಮಾ ಪರಿಹಾರ ಮಿತಿ' },
  scale_of_finance: { en: '₹10,000/ACRE PMFBY SCALE', kn: 'ರೂ. ೧೦,೦೦೦/ಎಕರೆ ನಿಯಮ' },
  disaster_type_label: { en: 'Disaster Type', kn: 'ವಿಕೋಪದ ಪ್ರಕಾರ' },
  disaster_date_label: { en: 'Disaster Date', kn: 'ವಿಕೋಪ ಸಂಭವಿಸಿದ ದಿನಾಂಕ' },
  damage_pct_label: { en: 'Damage Percentage', kn: 'ಹಾನಿಯ ಶೇಕಡಾವಾರು ಪ್ರಮಾಣ' },
  farmer_narrative: { en: 'Farmer Narrative / Description', kn: 'ರೈತರ ವಿವರಣೆ / ಅನುಭವ' },
  loss_amount_label: { en: 'Estimated Out-of-Pocket Crop Loss', kn: 'ಅಂದಾಜು ಮಾಡಿದ ಆರ್ಥಿಕ ನಷ್ಟದ ಮೊತ್ತ' },
  open_camera_btn: { en: '📸 Open Website Camera', kn: '📸 ವೆಬ್‌ಸೈಟ್ ಕ್ಯಾಮೆರಾ ತೆರೆಯಿರಿ' },

  // Automatic Verification Engine
  engine_title: { en: 'Automatic Evidence Verification Engine', kn: 'ಸ್ವಯಂಚಾಲಿತ ಪುರಾವೆ ಪರಿಶೀಲನಾ ಎಂಜಿನ್' },
  engine_desc: { en: 'Fusing Sentinel-2 satellite passes, Open-Meteo radar, and farmer ground evidence', kn: 'ಸೆಂಟಿನೆಲ್-2 ಉಪಗ್ರಹ, ಹವಾಮಾನ ರೇಡಾರ್ ಮತ್ತು ರೈತರ ಸಾಕ್ಷ್ಯಗಳನ್ನು ಸಮಗ್ರವಾಗಿ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ' },
  engine_complete_btn: { en: 'View Generated Claim & Dossier', kn: 'ರಚಿಸಲಾದ ಕ್ಲೇಮ್ ದಾಖಲೆ ವೀಕ್ಷಿಸಿ' },
  engine_processing_btn: { en: 'Synthesizing Evidence...', kn: 'ಪುರಾವೆಗಳನ್ನು ಸಂಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...' },

  // Insurer Dashboard
  ins_title: { en: 'Insurance Adjudication & Evidence Intelligence Suite', kn: 'ವಿಮಾ ತೀರ್ಪು ಮತ್ತು ಪುರಾವೆ ಗುಪ್ತಚರ ಕನ್ಸೋಲ್' },
  ins_subtitle: { 
    en: 'Real-time multi-sensor telemetry, Sentinel-2 spectral verification, IMD rainfall reanalysis, and autonomous multi-agent claim adjudication.', 
    kn: 'ನೈಜ ಸಮಯದ ಬಹು-ಸಂವೇದಕ ಉಪಗ್ರಹ ದತ್ತಾಂಶ, ಸೆಂಟಿನೆಲ್-2 ರೋಹಿತ ವಿಶ್ಲೇಷಣೆ, ಹವಾಮಾನ ಮಳೆ ರೇಡಾರ್ ಮತ್ತು ಎಐ ಏಜೆಂಟ್ ಸಮಿತಿಯ ಸ್ವಯಂಚಾಲಿತ ತೀರ್ಪು.' 
  },
  kpi_active_claims: { en: 'Total Active Claims', kn: 'ಒಟ್ಟು ಸಕ್ರಿಯ ಕ್ಲೇಮ್‌ಗಳು' },
  kpi_verified_damage: { en: 'Verified Flood Devastation', kn: 'ದೃಢೀಕರಿಸಿದ ಪ್ರವಾಹ ಹಾನಿ' },
  kpi_anomalies: { en: 'Suspected Anomalies', kn: 'ಅನುಮಾನಾಸ್ಪದ ವ್ಯತ್ಯಾಸಗಳು' },
  kpi_total_exposure: { en: 'Total Actuarial Exposure', kn: 'ಒಟ್ಟು ವಿಮಾ ಹೊಣೆಗಾರಿಕೆ' },

  // Claim Queue Table
  queue_search: { en: 'Search by farmer, survey, ULPIN, village...', kn: 'ರೈತರ ಹೆಸರು, ಸರ್ವೆ ಸಂ, ULPIN, ಗ್ರಾಮದ ಮೂಲಕ ಹುಡುಕಿ...' },
  filter_all_status: { en: 'All Statuses', kn: 'ಎಲ್ಲಾ ಸ್ಥಿತಿಗಳು' },
  filter_all_crops: { en: 'All Crops', kn: 'ಎಲ್ಲಾ ಬೆಳೆಗಳು' },
  filter_all_disasters: { en: 'All Disasters', kn: 'ಎಲ್ಲಾ ವಿಕೋಪಗಳು' },
  th_claim_no: { en: 'Claim #', kn: 'ಕ್ಲೇಮ್ ಸಂ.' },
  th_farmer_location: { en: 'Farmer & Location', kn: 'ರೈತ ಮತ್ತು ಸ್ಥಳ' },
  th_survey_land: { en: 'Survey & Land', kn: 'ಸರ್ವೆ ಮತ್ತು ಜಮೀನು' },
  th_crop_disaster: { en: 'Crop & Disaster', kn: 'ಬೆಳೆ ಮತ್ತು ವಿಕೋಪ' },
  th_telemetry: { en: 'Telemetry Evidence', kn: 'ಉಪಗ್ರಹ ಸಾಕ್ಷ್ಯ' },
  th_est_payout: { en: 'Est. Payout', kn: 'ಅಂದಾಜು ಪರಿಹಾರ' },
  th_status: { en: 'Status', kn: 'ಸ್ಥಿತಿ' },
  th_action: { en: 'Action', kn: 'ಕ್ರಮ' },
  btn_adjudicate: { en: 'Adjudicate', kn: 'ತೀರ್ಪು ನೀಡಿ' },

  // Claim Detail Page
  detail_fast_track: { en: 'FAST-TRACK ELIGIBLE', kn: 'ತ್ವರಿತ ಪಾವತಿಗೆ ಅರ್ಹ' },
  detail_flagged_fraud: { en: 'FLAGGED SUSPECTED ANOMALY', kn: 'ಅನುಮಾನಾಸ್ಪದ ವ್ಯತ್ಯಾಸ ಪತ್ತೆ' },
  btn_rerun_agents: { en: 'Re-run AI Agents', kn: 'ಎಐ ಏಜೆಂಟ್‌ಗಳನ್ನು ಮರುಚಾಲನೆ ಮಾಡಿ' },
  btn_open_pdf: { en: 'Official PDF Dossier', kn: 'ಅಧಿಕೃತ ಪಿಡಿಎಫ್ ದಾಖಲೆ' },
  btn_adjudicate_claim: { en: 'Adjudicate Claim', kn: 'ಕ್ಲೇಮ್ ತೀರ್ಪು ನೀಡಿ' },
  tab_xai_graph: { en: 'Explainable AI Evidence Graph', kn: 'ವಿವರಣಾತ್ಮಕ ಎಐ ಪುರಾವೆ ಗ್ರಾಫ್' },
  tab_agents_swarm: { en: 'Autonomous Multi-Agent Swarm', kn: 'ಸ್ವಾಯತ್ತ ಎಐ ಏಜೆಂಟ್ ಸಮಿತಿ' },
  tab_photos: { en: 'Ground Evidence Photos', kn: 'ನೆಲಮಟ್ಟದ ಛಾಯಾಚಿತ್ರ ಸಾಕ್ಷ್ಯಗಳು' },
  tab_copilot: { en: 'AI Copilot Assistant', kn: 'ಎಐ ಸಹಾಯಕ ಚಾಟ್' },

  // Evidence Graph
  xai_title: { en: 'Explainable AI Multi-Sensor Evidence Graph', kn: 'ವಿವರಣಾತ್ಮಕ ಎಐ ಬಹು-ಸಂವೇದಕ ಪುರಾವೆ ಗ್ರಾಫ್' },
  xai_desc: { 
    en: 'Interactive causal evidence network showing how physical sensors, orbital telemetry, and actuarial models arrive at the claim verdict.', 
    kn: 'ಭೌತಿಕ ಸಂವೇದಕಗಳು, ಕಕ್ಷೀಯ ಉಪಗ್ರಹ ಮತ್ತು ವಿಮಾ ಮಾದರಿಗಳು ಹೇಗೆ ಕ್ಲೇಮ್ ತೀರ್ಮಾನವನ್ನು ತಲುಪುತ್ತವೆ ಎಂಬುದನ್ನು ತೋರಿಸುವ ಸಂವಾದಾತ್ಮಕ ಗ್ರಾಫ್.' 
  },
  layer_all: { en: 'All Layers', kn: 'ಎಲ್ಲಾ ಪದರಗಳು' },
  layer_satellite: { en: '🛰️ Satellite', kn: '🛰️ ಉಪಗ್ರಹ' },
  layer_weather: { en: '🌧️ Weather', kn: '🌧️ ಹವಾಮಾನ' },
  layer_ground: { en: '📍 Ground Truth', kn: '📍 ಭೂಮಿ ಸಾಕ್ಷ್ಯ' },
  layer_actuarial: { en: '⚖️ Actuarial', kn: '⚖️ ವಿಮಾ ತೀರ್ಪು' },
  tri_sensor_title: { en: 'Tri-Sensor Cross-Validation Convergence', kn: 'ತ್ರಿ-ಸಂವೇದಕ ದೃಢೀಕರಣ ಒಮ್ಮುಖತೆ' },
  waterfall_title: { en: 'XAI Factor Attribution & Weight Waterfall', kn: 'ಎಐ ಅಂಶಗಳ ಕೊಡುಗೆ & ತೂಕದ ವಿವರಣೆ' },

  // Multi-Agent Swarm
  swarm_title: { en: 'Autonomous Multi-Agent Verification Swarm', kn: 'ಸ್ವಾಯತ್ತ ಬಹು-ಏಜೆಂಟ್ ಪರಿಶೀಲನಾ ಸಮಿತಿ' },
  swarm_desc: { 
    en: '5 specialized autonomous AI agents independently cross-examine evidentiary dimensions and establish tri-sensor convergence.', 
    kn: '೫ ಸ್ವತಂತ್ರ ಎಐ ಏಜೆಂಟ್‌ಗಳು ದಾಖಲೆ, ಉಪಗ್ರಹ, ಹವಾಮಾನ ಮತ್ತು ಭೂಮಿ ಸಾಕ್ಷ್ಯಗಳನ್ನು ಪ್ರತ್ಯೇಕವಾಗಿ ಪರಿಶೀಲಿಸಿ ಒಮ್ಮತದ ತೀರ್ಮಾನ ನೀಡುತ್ತವೆ.' 
  },
  agent_doc: { en: 'Document & Identity Corroboration Agent', kn: 'ದಾಖಲೆ ಮತ್ತು ಗುರುತಿನ ದೃಢೀಕರಣ ಏಜೆಂಟ್' },
  agent_fraud: { en: 'Anti-Fraud & EXIF Geofence Integrity Agent', kn: 'ಜಿಯೋಫೆನ್ಸ್ ವಂಚನೆ ವಿರೋಧಿ ಏಜೆಂಟ್' },
  agent_satellite: { en: 'Satellite Multispectral & Phenology Agent', kn: 'ಉಪಗ್ರಹ ರೋಹಿತ ಮತ್ತು ಬೆಳೆ ಹಂತದ ಏಜೆಂಟ್' },
  agent_damage: { en: 'Crop Phenology & Damage Classifier Agent', kn: 'ಬೆಳೆ ಹಾನಿ ವರ್ಗೀಕರಣ ಏಜೆಂಟ್' },
  agent_consensus: { en: 'Actuarial Consensus Synthesizer Agent', kn: 'ವಿಮಾ ಒಮ್ಮತ ತೀರ್ಪು ಸಂಶ್ಲೇಷಕ ಏಜೆಂಟ್' },

  // Adjudication Modal
  modal_adjudication_title: { en: 'Human Reviewer Adjudication Console', kn: 'ಮಾನವ ವಿಮರ್ಶಕರ ತೀರ್ಪು ಕನ್ಸೋಲ್' },
  action_approve: { en: 'Approve (Fast-Track DBT)', kn: 'ಅನುಮೋದಿಸಿ (ನೇರ ನಗದು ವರ್ಗಾವಣೆ - DBT)' },
  action_reject: { en: 'Reject', kn: 'ತಿರಸ್ಕರಿಸಿ' },
  action_request_evidence: { en: 'Request More Evidence', kn: 'ಹೆಚ್ಚಿನ ಪುರಾವೆ ಕೇಳಿ' },
  action_schedule_dbt: { en: 'Schedule DBT Payment', kn: 'ಡಿಬಿಟಿ ಪಾವತಿ ನಿಗದಿಪಡಿಸಿ' },
  label_approved_amount: { en: 'Approved Payout Amount (₹ INR)', kn: 'ಅನುಮೋದಿತ ಪರಿಹಾರ ಮೊತ್ತ (ರೂ.)' },
  label_rejection_reason: { en: 'Mandatory Rejection Justification', kn: 'ತಿರಸ್ಕರಣೆಯ ಕಡ್ಡಾಯ ಕಾರಣ' },
  label_requested_evidence: { en: 'Specific Evidence Requested from Farmer', kn: 'ರೈತರಿಂದ ಕೋರಲಾದ ನಿರ್ದಿಷ್ಟ ಪುರಾವೆ' },
  label_reviewer_notes: { en: 'Official Reviewer Comments & Audit Notes', kn: 'ಅಧಿಕೃತ ವಿಮರ್ಶಕರ ಟಿಪ್ಪಣಿಗಳು' },
  label_reviewer_name: { en: 'Reviewer Name', kn: 'ವಿಮರ್ಶಕರ ಹೆಸರು' },
  label_employee_id: { en: 'Employee ID', kn: 'ನೌಕರರ ಐಡಿ' },
  btn_commit_decision: { en: 'Commit & Notify Farmer Instantly', kn: 'ತೀರ್ಪು ಖಚಿತಪಡಿಸಿ & ರೈತರಿಗೆ ತಕ್ಷಣ ತಿಳಿಸಿ' }
};

/**
 * Helper to fetch translation by key with automatic fallback
 */
export const t = (key: string, lang: Language = 'en'): string => {
  const item = translations[key];
  if (!item) return key;
  return item[lang] || item.en || key;
};

/**
 * Helper to produce bilingual display text:
 * When lang is 'kn', shows Kannada primary with subtle English subtitle or translation.
 * Or if single string requested, returns target language.
 */
export const b = (enText: string, knText: string, lang: Language = 'en'): string => {
  return lang === 'kn' ? knText : enText;
};
