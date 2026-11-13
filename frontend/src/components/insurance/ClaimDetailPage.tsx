import React, { useState } from 'react';
import { ArrowLeft, FileText, CheckCircle2, ShieldCheck, MapPin, Calendar, Clock, AlertTriangle, Layers, User, Sparkles, MessageSquare, Bot } from 'lucide-react';
import { Claim } from '../../types';
import { GeospatialTwinViewer } from '../farmer/GeospatialTwinViewer';
import { MultiAgentPanel } from './MultiAgentPanel';
import { AICopilotChat } from './AICopilotChat';
import { EvidenceGraph } from './EvidenceGraph';
import { ReviewActionModal } from './ReviewActionModal';
import { b, t } from '../../utils/translations';

interface Props {
  claim: Claim;
  language?: 'en' | 'kn';
  onBack: () => void;
  onOpenReport: (claim: Claim) => void;
  onRunAgents: () => Promise<void>;
  onSubmitReviewAction: (payload: any) => Promise<void>;
}

export const ClaimDetailPage: React.FC<Props> = ({
  claim,
  language = 'en',
  onBack,
  onOpenReport,
  onRunAgents,
  onSubmitReviewAction
}) => {
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'twin' | 'agents' | 'graph' | 'copilot'>('twin');
  const [expandedPhoto, setExpandedPhoto] = useState<any | null>(null);

  return (
    <div className="space-y-6 text-white">
      {/* Top Navigation & Action Banner */}
      <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition cursor-pointer border border-slate-700"
            title="Return to Queue"
          >
            <ArrowLeft className="w-5 h-5 text-cyan-400" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-800/60">
                {claim.claim_number}
              </span>
              <span className="text-xs text-slate-400">
                {b('Filed on', 'ಸಲ್ಲಿಸಿದ ದಿನಾಂಕ', language)} {claim.created_at.slice(0, 10)}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white mt-1">
              {claim.farmer.name} • {claim.crop.crop_name} {b('Claim Adjudication', 'ಕ್ಲೇಮ್ ತೀರ್ಪು & ಪರಿಶೀಲನೆ', language)}
            </h1>
            <p className="text-xs text-slate-400">
              {claim.farmer.village}, {claim.farmer.district}, {claim.farmer.state} • {b('Land Parcel:', 'ಜಮೀನು:', language)} {claim.land.land_parcel_id} ({b('Survey #', 'ಸರ್ವೆ ಸಂಖ್ಯೆ #', language)}{claim.land.survey_number})
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onOpenReport(claim)}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 shadow-sm flex items-center gap-2 transition cursor-pointer"
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>{b('View Full Report', 'ಸಂಪೂರ್ಣ ವರದಿ ವೀಕ್ಷಿಸಿ', language)}</span>
          </button>

          <button
            onClick={() => setShowReviewModal(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-950/50 flex items-center gap-2 transition cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{b('Adjudicate / Review Decision', 'ತೀರ್ಪು ನೀಡಿ / ತೀರ್ಮಾನ ಪರಿಶೀಲಿಸಿ', language)}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 shadow-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">{b('Farmer Declared Loss', 'ರೈತರು ವರದಿ ಮಾಡಿದ ನಷ್ಟ', language)}</span>
          <span className="text-xl font-black text-white font-mono mt-1 block">
            ₹{claim.farmer_reported_loss.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-400">{b('Out of pocket estimate', 'ಅಂದಾಜು ಹಾನಿ ಮೊತ್ತ', language)}</span>
        </div>

        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 shadow-xl">
          <span className="text-[10px] uppercase font-bold text-cyan-400 block">{b('Indicative Payout', 'ಅಂದಾಜು ಪರಿಹಾರ', language)}</span>
          <span className="text-xl font-black text-cyan-300 font-mono mt-1 block">
            ₹{claim.estimated_payout.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-cyan-400/80 font-medium">{b('Scale of finance capped', 'ಪಿಎಂಎಫ್‌ಬಿವೈ ಮಿತಿಗೊಳಪಟ್ಟಿದೆ', language)}</span>
        </div>

        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 shadow-xl">
          <span className="text-[10px] uppercase font-bold text-blue-400 block">{b('Evidence Confidence', 'ಪುರಾವೆ ವಿಶ್ವಾಸಾರ್ಹತೆ', language)}</span>
          <span className="text-xl font-black text-blue-300 font-mono mt-1 block">
            {claim.evidence_confidence_score}%
          </span>
          <span className="text-[10px] text-blue-400/80 font-medium">{b('Sentinel & radar coherence', 'ಉಪಗ್ರಹ & ರೇಡಾರ್ ಒಮ್ಮುಖತೆ', language)}</span>
        </div>

        <div className={`rounded-2xl border p-4 shadow-xl ${
          claim.current_status === 'Flagged Fraud' ? 'border-red-500/80 bg-red-950/40' : 'bg-slate-900/80 border-slate-800'
        }`}>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">{b('Current Status', 'ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ', language)}</span>
          <span className={`text-sm font-black uppercase mt-1 block ${
            claim.current_status === 'Flagged Fraud' ? 'text-red-400 animate-pulse' : 'text-amber-400'
          }`}>
            {claim.current_status}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            {claim.current_status === 'Flagged Fraud' ? b('🚨 Intercepted by AI Swarm', '🚨 ಎಐ ಸಮಿತಿಯಿಂದ ತಡೆಹಿಡಿಯಲಾಗಿದೆ', language) : b('Human adjudication pending', 'ಮಾನವ ತೀರ್ಪು ಬಾಕಿಯಿದೆ', language)}
          </span>
        </div>
      </div>

      {/* Detail Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('twin')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'twin'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-950/50'
              : 'text-slate-300 hover:text-white bg-slate-800/80 border border-slate-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{b('Geospatial Evidence Twin', 'ಭೂ-ಅಂತರಿಕ್ಷ ಸಾಕ್ಷ್ಯ ದೃಶ್ಯ', language)}</span>
        </button>

        <button
          onClick={() => setActiveTab('agents')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'agents'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-950/50'
              : 'text-slate-300 hover:text-white bg-slate-800/80 border border-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{b('AI Verification Agents', 'ಎಐ ಪರಿಶೀಲನಾ ಏಜೆಂಟ್‌ಗಳು', language)} ({claim.ai_agents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('graph')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'graph'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-950/50'
              : 'text-slate-300 hover:text-white bg-slate-800/80 border border-slate-700'
          }`}
        >
          <span>🌐</span>
          <span>{b('Explainable Evidence Graph', 'ವಿವರಣಾತ್ಮಕ ಪುರಾವೆ ಗ್ರಾಫ್', language)}</span>
        </button>

        <button
          onClick={() => setActiveTab('copilot')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'copilot'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-950/50'
              : 'text-slate-300 hover:text-white bg-slate-800/80 border border-slate-700'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>{b('AI Reviewer Copilot', 'ಎಐ ವಿಮರ್ಶಕ ಕೋಪೈಲಟ್', language)}</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'twin' && (
        <div className="space-y-6">
          <GeospatialTwinViewer claim={claim} language={language} />

          {/* Meteorological and Ground Truth Gallery Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Meteorological Profile */}
            <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>🌧️</span>
                  <span>{b('Open-Meteo & IMD Rainfall Radar', 'ಓಪನ್-ಮೀಟಿಯೋ & ಐಎಂಡಿ ಮಳೆ ರೇಡಾರ್', language)}</span>
                </h4>
                <span className="text-[10px] text-red-300 font-mono font-bold bg-red-950/80 px-2.5 py-0.5 rounded-full border border-red-800/80">
                  {claim.weather.anomaly_ratio}x {b('Normal August', 'ಸಾಮಾನ್ಯ ಆಗಸ್ಟ್ ಸರಾಸರಿ', language)}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">{b('Peak Precipitation (Disaster Day)', 'ಗರಿಷ್ಠ ಮಳೆ (ವಿಪತ್ತಿನ ದಿನ)', language)}</span>
                  <span className="text-white font-mono font-bold">{claim.weather.rainfall_disaster_day_mm} mm</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">{b('7-Day Cumulative Runoff', '೭ ದಿನಗಳ ಒಟ್ಟು ಹರಿವು', language)}</span>
                  <span className="text-white font-mono font-bold">{claim.weather.rainfall_7day_cumulative_mm} mm</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">{b('Soil Saturation Threshold', 'ಮಣ್ಣಿನ ತೇವಾಂಶ ಮಿತಿ', language)}</span>
                  <span className="text-cyan-400 font-mono font-bold">{claim.weather.soil_saturation_pct}% ({b('Supersaturated', 'ಅತಿಯಾದ ತೇವಾಂಶ', language)})</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">{b('Meteorological Corroboration', 'ಹವಾಮಾನ ದೃಢೀಕರಣ', language)}</span>
                  <span className={`font-bold ${
                    claim.weather.rainfall_disaster_day_mm < 5.0 && claim.disaster.damage_percentage_reported > 30.0
                      ? 'text-red-400'
                      : 'text-cyan-400'
                  }`}>
                    {claim.weather.rainfall_disaster_day_mm < 5.0 && claim.disaster.damage_percentage_reported > 30.0
                      ? b('🚨 Contradiction: Dry Week (1.2 mm)', '🚨 ವಿರೋಧಾಭಾಸ: ಒಣ ವಾರ (1.2 ಮಿಮೀ)', language)
                      : b('Conclusive Extreme Weather', 'ತೀವ್ರ ಹವಾಮಾನ ಸಾಬೀತಾಗಿದೆ', language)}
                  </span>
                </div>
              </div>
            </div>

            {/* Farmer Photos Evidence Gallery */}
            <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>📸</span>
                  <span>{b('Geotagged Farmer Evidence Photos', 'ಜಿಯೋಟ್ಯಾಗ್ ಮಾಡಿದ ರೈತರ ಸಾಕ್ಷ್ಯ ಫೋಟೋಗಳು', language)}</span>
                </h4>
                {claim.photos.some(p => !p.metadata_verified) ? (
                  <span className="text-[10px] text-red-300 font-mono font-bold bg-red-950/80 px-2 py-0.5 rounded-full border border-red-800/80 animate-pulse">
                    {b('🚨 EXIF Spoofed / Geofence Breach', '🚨 ಜಿಯೋಫೆನ್ಸ್ ಉಲ್ಲಂಘನೆ ಪತ್ತೆ', language)}
                  </span>
                ) : (
                  <span className="text-[10px] text-cyan-300 font-mono font-bold bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-800/80">
                    {b('✓ EXIF Validated', '✓ ಎಕ್ಸಿಫ್ ದೃಢಪಟ್ಟಿದೆ', language)}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {claim.photos.map((p, idx) => (
                  <div
                    key={idx}
                    onClick={() => setExpandedPhoto(p)}
                    className="bg-slate-950 rounded-xl p-2 border border-slate-800 text-center hover:border-cyan-500 cursor-pointer transition transform hover:scale-[1.02]"
                    title="Click to view full forensic photograph"
                  >
                    <img src={p.photo_url} alt="Photo" className="w-full h-24 object-cover rounded-lg mb-1.5" />
                    <span className="text-[10px] text-white font-semibold block capitalize truncate">{p.photo_type.replace('_', ' ')}</span>
                    <span className="text-[9px] text-cyan-400 font-mono font-medium block">✓ {p.latitude.toFixed(4)}°N</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'agents' && (
        <MultiAgentPanel claim={claim} onRunAgents={onRunAgents} language={language} />
      )}

      {activeTab === 'graph' && (
        <EvidenceGraph claim={claim} language={language} />
      )}

      {activeTab === 'copilot' && (
        <AICopilotChat claim={claim} language={language} />
      )}

      {/* Enlarged Forensic Photo Viewer Modal */}
      {expandedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-[#090D16] border border-slate-800 rounded-3xl p-5 max-w-2xl w-full shadow-2xl overflow-hidden text-white">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-base">📸</span>
                <span className="font-bold text-white capitalize">{expandedPhoto.photo_type.replace('_', ' ')}</span>
                <span className="text-[10px] bg-cyan-950/80 text-cyan-300 px-2 py-0.5 rounded-full font-mono font-bold border border-cyan-800/60">
                  {b('GPS & EXIF MATCHED', 'ಜಿಪಿಎಸ್ & ಎಕ್ಸಿಫ್ ಹೊಂದಾಣಿಕೆಯಾಗಿದೆ', language)}
                </span>
              </div>
              <button
                onClick={() => setExpandedPhoto(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-800 mb-3 bg-slate-950">
              <img
                src={expandedPhoto.photo_url}
                alt="Enlarged forensic photo"
                className="w-full max-h-[460px] object-contain"
              />
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">{expandedPhoto.caption}</p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Centroid: {expandedPhoto.latitude.toFixed(4)}°N, {expandedPhoto.longitude.toFixed(4)}°E • Timestamp: {expandedPhoto.timestamp.replace('T', ' ')}
                </p>
              </div>
              <button
                onClick={() => setExpandedPhoto(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold cursor-pointer border border-slate-700"
              >
                {b('Close', 'ಮುಚ್ಚಿ', language)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reviewer Action Modal */}
      <ReviewActionModal
        claim={claim}
        isOpen={showReviewModal}
        language={language}
        onClose={() => setShowReviewModal(false)}
        onSubmitAction={onSubmitReviewAction}
      />
    </div>
  );
};
