import React, { useState } from 'react';
import {
  FilePlus,
  Layers,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Eye,
  Bell,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  PhoneCall,
  HelpCircle,
  Calendar,
  Check,
  ExternalLink,
  Compass,
  Search
} from 'lucide-react';
import { Claim, NotificationItem, OfficialLandRecord } from '../../types';
import { GeospatialTwinViewer } from './GeospatialTwinViewer';
import { VoiceAssistantModal } from './VoiceAssistantModal';
import { EvidenceAnalysisProgress } from './EvidenceAnalysisProgress';
import { FarmerULPINDashboard } from './FarmerULPINDashboard';
import { ForgotULPINDashboard } from './ForgotULPINDashboard';
import { b, t } from '../../utils/translations';

interface Props {
  claims: Claim[];
  notifications: NotificationItem[];
  language: 'en' | 'kn';
  currentUser?: any;
  onNewClaimSubmit: (data: any) => Promise<any>;
  onOpenReport: (claim: Claim) => void;
}

export const FarmerDashboard: React.FC<Props> = ({
  claims,
  notifications,
  language,
  currentUser,
  onNewClaimSubmit,
  onOpenReport
}) => {
  // Navigation View State: 'ulpin' (default on login), 'forgot_ulpin', or 'dossier'
  const [viewMode, setViewMode] = useState<'ulpin' | 'forgot_ulpin' | 'dossier'>('ulpin');
  const [showVoiceModal, setShowVoiceModal] = useState<boolean>(false);
  const [showAnalysisScreen, setShowAnalysisScreen] = useState<boolean>(false);
  const [newlyCreatedClaim, setNewlyCreatedClaim] = useState<Claim | null>(null);
  const [selectedLandRecord, setSelectedLandRecord] = useState<OfficialLandRecord | null>(null);

  const farmerName = currentUser?.name || 'Ravi Kumar';
  
  // Match claim for logged in farmer by mobile or first name, fallback to Ravi's or first claim
  const matchedClaim = claims.find(c => 
    (currentUser?.mobile && c.farmer.mobile === currentUser.mobile) ||
    (currentUser?.name && c.farmer.name.toLowerCase().includes(currentUser.name.toLowerCase().split(' ')[0])) ||
    c.farmer.name.includes('Ravi')
  ) || claims[0];

  const activeClaim = newlyCreatedClaim || matchedClaim;

  const handleProceedToAssessment = (land: OfficialLandRecord) => {
    setSelectedLandRecord(land);
    setShowVoiceModal(true);
  };

  const handleVoiceAssistantComplete = async (formData: any) => {
    setShowVoiceModal(false);
    setShowAnalysisScreen(true);
    
    try {
      const created = await onNewClaimSubmit({
        farmer_name: formData.farmerName,
        mobile: formData.mobile,
        state: formData.state,
        district: formData.district,
        village: formData.village,
        survey_number: formData.surveyNumber,
        land_area_acres: formData.landAreaAcres,
        latitude: formData.latitude,
        longitude: formData.longitude,
        polygon_coords: formData.polygonCoordinates,
        crop_name: formData.cropName,
        variety: formData.variety,
        sowing_date: formData.sowingDate,
        growth_stage: formData.growthStage,
        disaster_type: formData.disasterType,
        disaster_date: formData.disasterDate,
        reported_cause: formData.reportedCause,
        damage_percentage: formData.damagePercentage,
        farmer_loss_estimate: formData.farmerLossEstimate,
        description: formData.description,
        photos: formData.photos,
        ulpin: selectedLandRecord?.ulpin || formData.landParcelId
      });

      if (created) {
        if (!created.land.polygon_geojson && formData.polygonCoordinates) {
          created.land.polygon_geojson = formData.polygonCoordinates;
        }
        setNewlyCreatedClaim(created);
      }
    } catch (e) {
      console.error('Error submitting claim:', e);
    }
  };

  const handleAnalysisComplete = () => {
    setShowAnalysisScreen(false);
    // Direct directly to Active Claim Dossier & Geospatial Evidence Twin
    setViewMode('dossier');
  };

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* TOP VIEW SELECTOR TABS                                          */}
      {/* ============================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setViewMode('ulpin')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              viewMode === 'ulpin' || viewMode === 'forgot_ulpin'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🌾</span>
            <span>{b('Identify Land (ULPIN)', 'ಭೂಮಿ ಗುರುತಿಸಿ (ULPIN)', language)}</span>
          </button>

          {activeClaim && (
            <button
              type="button"
              onClick={() => setViewMode('dossier')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                viewMode === 'dossier'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{b('Claim Dossiers & Satellite Twin', 'ಕ್ಲೇಮ್ ಕಡತ & ಉಪಗ್ರಹ ದೃಶ್ಯ', language)}</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                viewMode === 'dossier' ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-emerald-800'
              }`}>
                {activeClaim.claim_number}
              </span>
            </button>
          )}
        </div>

        {viewMode === 'dossier' && (
          <button
            type="button"
            onClick={() => {
              setSelectedLandRecord(null);
              setViewMode('ulpin');
            }}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <FilePlus className="w-3.5 h-3.5" />
            <span>{b('File New Claim via ULPIN', 'ULPIN ಮೂಲಕ ಹೊಸ ಕ್ಲೇಮ್ ಸಲ್ಲಿಸಿ', language)}</span>
          </button>
        )}
      </div>

      {/* ============================================================== */}
      {/* VIEW 1: FARMER ULPIN IDENTIFICATION DASHBOARD                  */}
      {/* ============================================================== */}
      {viewMode === 'ulpin' && (
        <FarmerULPINDashboard
          currentUser={currentUser}
          language={language}
          onProceedToAssessment={handleProceedToAssessment}
          onNavigateToForgotULPIN={() => setViewMode('forgot_ulpin')}
          onViewPreviousClaims={() => setViewMode('dossier')}
          hasExistingClaims={Boolean(activeClaim)}
        />
      )}

      {/* ============================================================== */}
      {/* VIEW 2: FORGOT ULPIN RECOVERY DASHBOARD                        */}
      {/* ============================================================== */}
      {viewMode === 'forgot_ulpin' && (
        <ForgotULPINDashboard
          currentUser={currentUser}
          language={language}
          onBackToDashboard={() => setViewMode('ulpin')}
          onContinueToAssessment={handleProceedToAssessment}
        />
      )}

      {/* ============================================================== */}
      {/* VIEW 3: ACTIVE CLAIM DOSSIER & GEOSPATIAL TWIN                */}
      {/* ============================================================== */}
      {viewMode === 'dossier' && activeClaim && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Dossier Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
            <button
              onClick={() => setViewMode('ulpin')}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-2 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-700" />
              <span>{b('Back to Land Identification (ULPIN)', 'ಭೂಮಿ ಗುರುತಿಸುವಿಕೆಗೆ ಹಿಂತಿರುಗಿ (ULPIN)', language)}</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-500">
                {b('Claim:', 'ಕ್ಲೇಮ್:', language)} <strong className="text-slate-900">{activeClaim.claim_number}</strong>
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500">
                {b('Status:', 'ಸ್ಥಿತಿ:', language)} <strong className="text-emerald-700">{activeClaim.current_status}</strong>
              </span>
            </div>
          </div>

          {/* Dossier Header Card */}
          <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-6 md:p-8 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
                    {activeClaim.claim_number}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {b('Filed on', 'ಸಲ್ಲಿಸಿದ ದಿನಾಂಕ', language)} {activeClaim.created_at.slice(0, 10)}
                  </span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    activeClaim.current_status === 'Approved'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : activeClaim.current_status === 'Flagged Fraud' || activeClaim.current_status === 'Rejected'
                      ? 'bg-red-100 text-red-800 border border-red-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {activeClaim.current_status}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {activeClaim.crop.crop_name} {b('Crop Damage Claim Dossier', 'ಬೆಳೆ ಹಾನಿ ಕ್ಲೇಮ್ ಕಡತ', language)}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 flex flex-wrap items-center gap-2">
                  <span>📍 {activeClaim.farmer.village}, {activeClaim.farmer.district}</span>
                  <span className="text-slate-400">•</span>
                  <span>{b('Survey #', 'ಸರ್ವೆ ಸಂಖ್ಯೆ #', language)}{activeClaim.land.survey_number}</span>
                  <span className="text-slate-400">•</span>
                  <span>DIGIPIN: <span className="font-mono text-emerald-800 font-semibold">{activeClaim.land.digipin}</span></span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onOpenReport(activeClaim)}
                  className="px-5 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>{b('View Official Verification Report', 'ಅಧಿಕೃತ ಪರಿಶೀಲನಾ ವರದಿ ವೀಕ್ಷಿಸಿ', language)}</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <span className="text-[11px] text-slate-500 font-medium block">
                  {b('Reported Disaster', 'ವರದಿ ಮಾಡಿದ ವಿಪತ್ತು', language)}
                </span>
                <strong className="text-sm font-bold text-red-700 mt-0.5 block">
                  {activeClaim.disaster.disaster_type} ({activeClaim.disaster.damage_percentage_reported}%)
                </strong>
                <span className="text-[10px] text-slate-500 font-mono">
                  {b('Date:', 'ದಿನಾಂಕ:', language)} {activeClaim.disaster.disaster_date}
                </span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <span className="text-[11px] text-slate-500 font-medium block">
                  {b('Sentinel-2 NDVI Drop', 'ಸೆಂಟಿನೆಲ್-2 ಹಸಿರು ಇಳಿಕೆ', language)}
                </span>
                <strong className="text-sm font-bold text-amber-700 mt-0.5 block">
                  -{activeClaim.satellite.vegetation_drop_pct.toFixed(1)}% {b('Canopy', 'ಹಂದರ', language)}
                </strong>
                <span className="text-[10px] text-slate-500 font-mono">
                  {b('Pre:', 'ಮೊದಲು:', language)} {activeClaim.satellite.ndvi_pre_avg} ➔ {b('Post:', 'ನಂತರ:', language)} {activeClaim.satellite.ndvi_post_avg}
                </span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <span className="text-[11px] text-slate-500 font-medium block">
                  {b('Peak 24h Rainfall', 'ಗರಿಷ್ಠ 24ಗಂ ಮಳೆ', language)}
                </span>
                <strong className="text-sm font-bold text-blue-700 mt-0.5 block">
                  {activeClaim.weather.rainfall_disaster_day_mm} mm
                </strong>
                <span className="text-[10px] text-slate-500 font-mono">
                  {b('Soil Saturation:', 'ಮಣ್ಣಿನ ತೇವಾಂಶ:', language)} {activeClaim.weather.soil_saturation_pct}%
                </span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <span className="text-[11px] text-slate-500 font-medium block">
                  {b('Indicative PMFBY Payout', 'ಅಂದಾಜು ಪಿಎಂಎಫ್‌ಬಿವೈ ಪರಿಹಾರ', language)}
                </span>
                <strong className="text-base font-black text-emerald-700 mt-0.5 block">
                  ₹{activeClaim.estimated_payout.toLocaleString('en-IN')}
                </strong>
                <span className="text-[10px] text-slate-500 font-mono">
                  {b('Confidence:', 'ವಿಶ್ವಾಸಾರ್ಹತೆ:', language)} {activeClaim.evidence_confidence_score}%
                </span>
              </div>
            </div>
          </div>

          {/* Reviewer Audit Callout if exists */}
          {activeClaim.reviewer_comments && (
            <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-xs text-slate-900 block font-bold">
                  {b('Official Reviewer Remarks', 'ಅಧಿಕೃತ ವಿಮರ್ಶಕರ ಟಿಪ್ಪಣಿಗಳು', language)} ({activeClaim.reviewer_name || 'Senior Agronomist'} • {activeClaim.reviewer_id || 'REV-EMP-409'}):
                </strong>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                  "{activeClaim.reviewer_comments}"
                </p>
              </div>
            </div>
          )}

          {/* Geospatial Evidence Twin Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>🌾</span>
                <span>{b('Your Land Parcel Geospatial Evidence Twin', 'ನಿಮ್ಮ ಜಮೀನಿನ ಭೂ-ಅಂತರಿಕ್ಷ ಪುರಾವೆ ದೃಶ್ಯ (ಟ್ವಿನ್)', language)}</span>
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                {b('Sentinel-2 MSI Multi-Band Imagery', 'ಸೆಂಟಿನೆಲ್-2 ಎಂಎಸ್‌ಐ ಮಲ್ಟಿ-ಬ್ಯಾಂಡ್ ಚಿತ್ರಣ', language)}
              </span>
            </div>

            <GeospatialTwinViewer claim={activeClaim} language={language} />
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP-WISE CROP ASSESSMENT MODAL (PRE-POPULATED WITH ULPIN)     */}
      {/* ============================================================== */}
      <VoiceAssistantModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onComplete={handleVoiceAssistantComplete}
        language={language}
        initialLandData={selectedLandRecord}
      />

      {/* Automatic Analysis Animation Screen */}
      {showAnalysisScreen && (
        <EvidenceAnalysisProgress
          onComplete={handleAnalysisComplete}
          language={language}
        />
      )}
    </div>
  );
};
