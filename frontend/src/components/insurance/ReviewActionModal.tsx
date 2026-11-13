import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, CreditCard, X, ShieldAlert, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Claim } from '../../types';

interface Props {
  claim: Claim;
  isOpen: boolean;
  onClose: () => void;
  onSubmitAction: (payload: {
    action: string;
    reviewer_id: string;
    reviewer_name: string;
    comments: string;
    approved_amount?: number;
    rejection_reason?: string;
    requested_evidence?: string;
  }) => Promise<void>;
}

export const ReviewActionModal: React.FC<Props> = ({
  claim,
  isOpen,
  onClose,
  onSubmitAction
}) => {
  const [selectedAction, setSelectedAction] = useState<'approve' | 'reject' | 'request_evidence' | 'schedule_payment'>('approve');
  const [reviewerName, setReviewerName] = useState<string>('Ananya Sharma (Senior Agronomist)');
  const [reviewerId, setReviewerId] = useState<string>('REV-EMP-409');
  const [approvedAmount, setApprovedAmount] = useState<number>(claim.estimated_payout);
  const [comments, setComments] = useState<string>('Satellite NDVI drop and rainfall radar spikes conclusively corroborate flood inundation. Claim approved in accordance with PMFBY Kharif 2026 norms.');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [requestedEvidence, setRequestedEvidence] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (selectedAction === 'approve') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      await onSubmitAction({
        action: selectedAction,
        reviewer_id: reviewerId,
        reviewer_name: reviewerName,
        comments: comments,
        approved_amount: selectedAction === 'approve' || selectedAction === 'schedule_payment' ? approvedAmount : undefined,
        rejection_reason: selectedAction === 'reject' ? rejectionReason : undefined,
        requested_evidence: selectedAction === 'request_evidence' ? requestedEvidence : undefined
      });

      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white border border-slate-200/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Human Reviewer Adjudication Console
              </h3>
              <p className="text-xs text-slate-500">
                Claim: <span className="text-slate-800 font-mono font-semibold">{claim.claim_number}</span> • Farmer: {claim.farmer.name}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Type Tabs */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedAction('approve');
                setComments('Satellite NDVI drop and rainfall radar spikes conclusively corroborate flood inundation. Claim approved in accordance with PMFBY Kharif 2026 norms.');
              }}
              className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition cursor-pointer ${
                selectedAction === 'approve'
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Approve</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedAction('reject');
                setComments('Adjudication decision: Claim rejected based on policy exclusion or contradictory evidence.');
              }}
              className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition cursor-pointer ${
                selectedAction === 'reject'
                  ? 'bg-red-600 border-red-600 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <XCircle className="w-5 h-5" />
              <span>Reject</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedAction('request_evidence');
                setComments('Reviewer requested supplementary evidentiary submission.');
              }}
              className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition cursor-pointer ${
                selectedAction === 'request_evidence'
                  ? 'bg-amber-600 border-amber-600 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <AlertCircle className="w-5 h-5" />
              <span>More Evidence</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedAction('schedule_payment');
                setComments('Direct DBT batch payout scheduled for approved claim.');
              }}
              className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition cursor-pointer ${
                selectedAction === 'schedule_payment'
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              <span>Schedule DBT</span>
            </button>
          </div>

          {/* Conditional inputs */}
          {(selectedAction === 'approve' || selectedAction === 'schedule_payment') && (
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2">
              <label className="text-xs font-semibold text-emerald-900 block">
                Approved Payout Amount (₹ INR)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-emerald-800">₹</span>
                <input
                  type="number"
                  value={approvedAmount}
                  onChange={e => setApprovedAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-emerald-300 rounded-xl px-4 py-2 text-lg font-bold text-emerald-700 font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <span className="text-[11px] text-slate-500 block">
                Recommended Indicative Baseline: ₹{claim.estimated_payout.toLocaleString('en-IN')} (Sum Insured Cap: ₹{claim.crop.sum_insured.toLocaleString('en-IN')})
              </span>
            </div>
          )}

          {selectedAction === 'reject' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-red-900 block">
                Mandatory Rejection Justification
              </label>
              <textarea
                required
                rows={2}
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="State specific policy clause or contradictory satellite data..."
                className="w-full bg-white border border-red-300 rounded-xl p-3 text-slate-900 text-xs outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
          )}

          {selectedAction === 'request_evidence' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-amber-900 block">
                Specific Evidence Requested from Farmer
              </label>
              <textarea
                required
                rows={2}
                value={requestedEvidence}
                onChange={e => setRequestedEvidence(e.target.value)}
                placeholder="E.g., Please upload close-up photos of root rot, or updated canal water discharge certificate..."
                className="w-full bg-white border border-amber-300 rounded-xl p-3 text-slate-900 text-xs outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          )}

          {/* Reviewer Comments */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Official Reviewer Comments & Audit Notes
            </label>
            <textarea
              rows={2}
              value={comments}
              onChange={e => setComments(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-800 text-xs outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Reviewer Identity */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Reviewer Name</label>
              <input
                type="text"
                value={reviewerName}
                onChange={e => setReviewerName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Employee ID</label>
              <input
                type="text"
                value={reviewerId}
                onChange={e => setReviewerId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-mono outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
            >
              {submitting ? 'Broadcasting Decision...' : 'Commit & Notify Farmer Instantly'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
