import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, FileText, CheckCircle2, Clock, DollarSign, Activity, TrendingUp } from 'lucide-react';
import { Claim, StatsKPI } from '../../types';
import { ClaimQueueTable } from './ClaimQueueTable';
import { ClaimDetailPage } from './ClaimDetailPage';

interface Props {
  claims: Claim[];
  stats: StatsKPI | null;
  onOpenReport: (claim: Claim) => void;
  onRunAgents: (claimId: string) => Promise<void>;
  onSubmitReviewAction: (claimId: string, payload: any) => Promise<void>;
}

export const InsuranceDashboard: React.FC<Props> = ({
  claims,
  stats,
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
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-emerald-900 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-white">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-emerald-100 text-xs font-semibold mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>National Crop Insurance Verification Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Insurance Adjudication & Evidence Intelligence Suite
          </h1>
          <p className="text-sm text-emerald-100/90 mt-1 max-w-2xl leading-relaxed">
            Multi-spectral Sentinel-2 satellite analysis, automated fraud geofencing, and AI multi-agent claim verification.
          </p>
        </div>

        <div className="text-right bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0">
          <span className="text-[11px] uppercase font-bold text-emerald-200 block">Total Pipeline Value</span>
          <span className="text-2xl font-black text-emerald-300 font-mono">
            ₹{stats?.total_estimated_claim_value?.toLocaleString('en-IN') || '1,72,500'}
          </span>
          <span className="text-[10px] text-emerald-200/80 block">Across 6 monitored districts</span>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Claims */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-500">Total Claims</span>
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
            {stats?.total_claims || claims.length}
          </span>
          <span className="text-[10px] text-slate-500">100% telemetry synced</span>
        </div>

        {/* Pending Verification */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:border-amber-400/60 hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-amber-700">Pending Review</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-amber-700 font-mono mt-1 block">
            {stats?.pending_verification || 3}
          </span>
          <span className="text-[10px] text-amber-600 font-medium">Awaiting officer adjudication</span>
        </div>

        {/* AI Flagged / Additional Evidence */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:border-emerald-400/60 hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-emerald-700">Approved Payouts</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-emerald-700 font-mono mt-1 block">
            {stats?.approved_claims || 2}
          </span>
          <span className="text-[10px] text-emerald-600 font-medium">Fast-tracked via AI Twin</span>
        </div>

        {/* Processing Velocity */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:border-blue-400/60 hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-blue-700">Avg Settlement Speed</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-blue-700 font-mono mt-1 block">
            {stats?.average_processing_time_hours || 14.5} hrs
          </span>
          <span className="text-[10px] text-blue-600 font-medium">Reduced from 45 days baseline</span>
        </div>
      </div>

      {/* Main Claim Queue Table */}
      <ClaimQueueTable claims={claims} onSelectClaim={(c) => setSelectedClaim(c)} />
    </div>
  );
};
