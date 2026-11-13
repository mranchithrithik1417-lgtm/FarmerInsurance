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
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-2 shadow-lg">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode('ulpin')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              viewMode === 'ulpin' || viewMode === 'forgot_ulpin'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🌾</span>
            <span>Identify Land (ULPIN)</span>
          </button>

          {activeClaim && (
            <button
              type="button"
              onClick={() => setViewMode('dossier')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                viewMode === 'dossier'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Claim Dossiers & Satellite Twin</span>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-emerald-400 rounded-full border border-emerald-500/30 font-bold">
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
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-emerald-600/20"
          >
            <FilePlus className="w-3.5 h-3.5" />
            <span>File New Claim via ULPIN</span>
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
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 shadow-md">
            <button
              onClick={() => setViewMode('ulpin')}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-2 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400" />
              <span>Back to Land Identification (ULPIN)</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">
                Claim: <strong className="text-emerald-400">{activeClaim.claim_number}</strong>
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400">
                Status: <strong className="text-cyan-300">{activeClaim.current_status}</strong>
              </span>
            </div>
          </div>

          {/* Dossier Header Card */}
          <div className="relative overflow-hidden rounded-3xl bg-slate-900/90 border border-slate-800 p-6 md:p-8 shadow-2xl backdrop-blur-md">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30">
                    {activeClaim.claim_number}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Filed on {activeClaim.created_at.slice(0, 10)}
                  </span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    activeClaim.current_status === 'Approved'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : activeClaim.current_status === 'Flagged Fraud' || activeClaim.current_status === 'Rejected'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}>
                    {activeClaim.current_status}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  {activeClaim.crop.crop_name} Crop Damage Claim Dossier
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 flex flex-wrap items-center gap-2">
                  <span>📍 {activeClaim.farmer.village}, {activeClaim.farmer.district}</span>
                  <span>•</span>
                  <span>Survey #{activeClaim.land.survey_number}</span>
                  <span>•</span>
                  <span>DIGIPIN: <span className="font-mono text-cyan-300 font-semibold">{activeClaim.land.digipin}</span></span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onOpenReport(activeClaim)}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>View Official Verification Report</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
              <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
                <span className="text-[11px] text-slate-400 font-medium block">Reported Disaster</span>
                <strong className="text-sm font-bold text-rose-400 mt-0.5 block">
                  {activeClaim.disaster.disaster_type} ({activeClaim.disaster.damage_percentage_reported}%)
                </strong>
                <span className="text-[10px] text-slate-500 font-mono">Date: {activeClaim.disaster.disaster_date}</span>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
                <span className="text-[11px] text-slate-400 font-medium block">Sentinel-2 NDVI Drop</span>
                <strong className="text-sm font-bold text-amber-400 mt-0.5 block">
                  -{activeClaim.satellite.vegetation_drop_pct.toFixed(1)}% Canopy
                </strong>
                <span className="text-[10px] text-slate-500 font-mono">Pre: {activeClaim.satellite.ndvi_pre_avg} ➔ Post: {activeClaim.satellite.ndvi_post_avg}</span>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
                <span className="text-[11px] text-slate-400 font-medium block">Peak 24h Rainfall</span>
                <strong className="text-sm font-bold text-cyan-400 mt-0.5 block">
                  {activeClaim.weather.rainfall_disaster_day_mm} mm
                </strong>
                <span className="text-[10px] text-slate-500 font-mono">Soil Saturation: {activeClaim.weather.soil_saturation_pct}%</span>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
                <span className="text-[11px] text-slate-400 font-medium block">Indicative PMFBY Payout</span>
                <strong className="text-base font-black text-emerald-400 mt-0.5 block">
                  ₹{activeClaim.estimated_payout.toLocaleString('en-IN')}
                </strong>
                <span className="text-[10px] text-slate-500 font-mono">Confidence: {activeClaim.evidence_confidence_score}%</span>
              </div>
            </div>
          </div>

          {/* Reviewer Audit Callout if exists */}
          {activeClaim.reviewer_comments && (
            <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-xs text-white block">
                  Official Reviewer Remarks ({activeClaim.reviewer_name || 'Senior Agronomist'} • {activeClaim.reviewer_id || 'REV-EMP-409'}):
                </strong>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  "{activeClaim.reviewer_comments}"
                </p>
              </div>
            </div>
          )}

          {/* Geospatial Evidence Twin Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>🌾</span>
                <span>Your Land Parcel Geospatial Evidence Twin</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                Sentinel-2 MSI Multi-Band Imagery
              </span>
            </div>

            <GeospatialTwinViewer claim={activeClaim} />
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
        />
      )}
    </div>
  );
};
