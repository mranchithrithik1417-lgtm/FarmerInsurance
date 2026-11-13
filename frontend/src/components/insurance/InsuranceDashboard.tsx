import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, FileText, CheckCircle2, Clock, DollarSign, Activity, TrendingUp } from 'lucide-react';
import { Claim, StatsKPI } from '../../types';
import { ClaimQueueTable } from './ClaimQueueTable';
import { ClaimDetailPage } from './ClaimDetailPage';
import { b, t } from '../../utils/translations';

interface Props {
  claims: Claim[];
  stats: StatsKPI | null;
  language?: 'en' | 'kn';
  onOpenReport: (claim: Claim) => void;
  onRunAgents: (claimId: string) => Promise<void>;
  onSubmitReviewAction: (claimId: string, payload: any) => Promise<void>;
}

export const InsuranceDashboard: React.FC<Props> = ({
  claims,
  stats,
  language = 'en',
  onOpenReport,
  onRunAgents,
  onSubmitReviewAction
}) => {
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);

  // If a claim is clicked, show its deep detail page
  if (selectedClaim) {
    const currentClaimData = claims.find(c => c.id === selectedClaim.id) || selectedClaim;
    return (
      <ClaimDetailPage
        claim={currentClaimData}
        language={language}
        onBack={() => setSelectedClaim(null)}
        onOpenReport={onOpenReport}
        onRunAgents={() => onRunAgents(currentClaimData.id)}
        onSubmitReviewAction={(payload) => onSubmitReviewAction(currentClaimData.id, payload)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-blue-50/80 via-white to-slate-50 border border-blue-200 rounded-3xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 border border-blue-300 text-blue-900 text-xs font-bold mb-3">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            <span>{b('National Crop Insurance Verification Console', 'ರಾಷ್ಟ್ರೀಯ ಬೆಳೆ ವಿಮಾ ಪರಿಶೀಲನಾ ಕನ್ಸೋಲ್', language)}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {b('Insurance Adjudication & Evidence Intelligence Suite', 'ವಿಮಾ ತೀರ್ಪು ಮತ್ತು ಪುರಾವೆ ಗುಪ್ತಚರ ಸೂಟ್', language)}
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            {b(
              'Multi-spectral Sentinel-2 satellite analysis, automated fraud geofencing, and AI multi-agent claim verification.',
              'ಸೆಂಟಿನೆಲ್-2 ಮಲ್ಟಿ-ಸ್ಪೆಕ್ಟ್ರಲ್ ಉಪಗ್ರಹ ವಿಶ್ಲೇಷಣೆ, ಜಿಯೋಫೆನ್ಸಿಂಗ್ ಮತ್ತು ಎಐ ಬಹು-ಏಜೆಂಟ್ ಕ್ಲೇಮ್ ಪರಿಶೀಲನೆ.',
              language
            )}
          </p>
        </div>

        <div className="text-right bg-white p-4 rounded-2xl border border-blue-200 shadow-xs">
          <span className="text-[11px] uppercase font-bold text-slate-500 block">{b('Total Pipeline Value', 'ಒಟ್ಟು ವಿಮಾ ಕ್ಲೇಮ್ ಮೌಲ್ಯ', language)}</span>
          <span className="text-2xl font-black text-emerald-700 font-mono">
            ₹{stats?.total_estimated_claim_value?.toLocaleString('en-IN') || '1,72,500'}
          </span>
          <span className="text-[10px] text-slate-500 block font-medium">{b('Across 6 monitored districts', '೬ ಮೇಲ್ವಿಚಾರಣಾ ಜಿಲ್ಲೆಗಳಲ್ಲಿ', language)}</span>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Claims */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-500">{b('Total Claims', 'ಒಟ್ಟು ಕ್ಲೇಮ್‌ಗಳು', language)}</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
            {stats?.total_claims || claims.length}
          </span>
          <span className="text-[10px] text-slate-500 font-medium">{b('100% telemetry synced', '100% ದತ್ತಾಂಶ ಸಿಂಕ್ ಆಗಿದೆ', language)}</span>
        </div>

        {/* Pending Verification */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-amber-400 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-amber-800">{b('Pending Review', 'ಪರಿಶೀಲನೆ ಬಾಕಿ', language)}</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-2xl font-black text-amber-700 font-mono mt-1 block">
            {stats?.pending_verification || 3}
          </span>
          <span className="text-[10px] text-amber-800 font-medium">{b('Awaiting officer adjudication', 'ಅಧಿಕಾರಿಯ ತೀರ್ಪಿಗೆ ಕಾಯುತ್ತಿದೆ', language)}</span>
        </div>

        {/* AI Flagged / Additional Evidence */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-blue-400 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-blue-800">{b('Approved Payouts', 'ಅನುಮೋದಿತ ಪಾವತಿಗಳು', language)}</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl font-black text-blue-700 font-mono mt-1 block">
            {stats?.approved_claims || 2}
          </span>
          <span className="text-[10px] text-blue-800 font-medium">{b('Fast-tracked via AI Twin', 'ಎಐ ಟ್ವಿನ್ ಮೂಲಕ ವೇಗವರ್ಧಿತ', language)}</span>
        </div>

        {/* Processing Velocity */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-emerald-400 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-emerald-800">{b('Avg Settlement Speed', 'ಸರಾಸರಿ ವಿಲೇವಾರಿ ವೇಗ', language)}</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-emerald-700 font-mono mt-1 block">
            {stats?.average_processing_time_hours || 14.5} {b('hrs', 'ಗಂಟೆ', language)}
          </span>
          <span className="text-[10px] text-emerald-800 font-medium">{b('Reduced from 45 days baseline', '೪೫ ದಿನಗಳಿಂದ ಕಡಿತಗೊಳಿಸಲಾಗಿದೆ', language)}</span>
        </div>
      </div>

      {/* Main Claim Queue Table */}
      <ClaimQueueTable claims={claims} language={language} onSelectClaim={(c) => setSelectedClaim(c)} />
    </div>
  );
};
