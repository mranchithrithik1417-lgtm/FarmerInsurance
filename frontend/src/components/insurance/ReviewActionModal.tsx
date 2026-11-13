import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, CreditCard, X, ShieldAlert, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Claim } from '../../types';
import { b, t } from '../../utils/translations';

interface Props {
  claim: Claim;
  isOpen: boolean;
  language?: 'en' | 'kn';
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
  language = 'en',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200">
              <ShieldAlert className="w-5 h-5 text-emerald-800" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {b('Human Reviewer Adjudication Console', 'ಮಾನವ ವಿಮರ್ಶಕರ ತೀರ್ಪು ಕನ್ಸೋಲ್', language)}
              </h3>
              <p className="text-xs text-slate-600">
                {b('Claim:', 'ಕ್ಲೇಮ್:', language)} <span className="text-slate-900 font-mono font-bold">{claim.claim_number}</span> • {b('Farmer:', 'ರೈತರು:', language)} {claim.farmer.name}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-lg">
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
                setComments(language === 'kn' ? 'ಉಪಗ್ರಹ NDVI ಇಳಿಕೆ ಮತ್ತು ಮಳೆ ರೇಡಾರ್ ಪ್ರವಾಹ ಹಾನಿಯನ್ನು ದೃಢೀಕರಿಸುತ್ತವೆ. PMFBY ನಿಯಮಗಳ ಪ್ರಕಾರ ಕ್ಲೇಮ್ ಅನುಮೋದಿಸಲಾಗಿದೆ.' : 'Satellite NDVI drop and rainfall radar spikes conclusively corroborate flood inundation. Claim approved in accordance with PMFBY Kharif 2026 norms.');
              }}
              className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition cursor-pointer ${
                selectedAction === 'approve'
                  ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-sm ring-1 ring-emerald-600'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              <span>{b('Approve', 'ಅನುಮೋದಿಸಿ', language)}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedAction('reject');
                setComments(language === 'kn' ? 'ತೀರ್ಪು: ವಿರೋಧಾಭಾಸದ ಪುರಾವೆ ಅಥವಾ ಪಾಲಿಸಿ ವಿನಾಯಿತಿ ಕಾರಣದಿಂದ ಕ್ಲೇಮ್ ತಿರಸ್ಕರಿಸಲಾಗಿದೆ.' : 'Adjudication decision: Claim rejected based on policy exclusion or contradictory evidence.');
              }}
              className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition cursor-pointer ${
                selectedAction === 'reject'
                  ? 'bg-red-50 border-red-600 text-red-800 shadow-sm ring-1 ring-red-600'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <XCircle className="w-5 h-5 text-red-600" />
              <span>{b('Reject', 'ತಿರಸ್ಕರಿಸಿ', language)}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedAction('request_evidence');
                setComments(language === 'kn' ? 'ಹೆಚ್ಚುವರಿ ಪುರಾವೆಗಳನ್ನು ಸಲ್ಲಿಸಲು ಕೋರಲಾಗಿದೆ.' : 'Reviewer requested supplementary evidentiary submission.');
              }}
              className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition cursor-pointer ${
                selectedAction === 'request_evidence'
                  ? 'bg-amber-50 border-amber-600 text-amber-900 shadow-sm ring-1 ring-amber-600'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <span>{b('More Evidence', 'ಹೆಚ್ಚಿನ ಪುರಾವೆ', language)}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedAction('schedule_payment');
                setComments(language === 'kn' ? 'ಅನುಮೋದಿತ ಕ್ಲೇಮ್‌ಗೆ ನೇರ ನಗದು ವರ್ಗಾವಣೆ (DBT) ಪಾವತಿ ನಿಗದಿಪಡಿಸಲಾಗಿದೆ.' : 'Direct DBT batch payout scheduled for approved claim.');
              }}
              className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition cursor-pointer ${
                selectedAction === 'schedule_payment'
                  ? 'bg-sky-50 border-sky-600 text-sky-800 shadow-sm ring-1 ring-sky-600'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <CreditCard className="w-5 h-5 text-sky-700" />
              <span>{b('Schedule DBT', 'ಡಿಬಿಟಿ ಪಾವತಿ', language)}</span>
            </button>
          </div>

          {/* Conditional inputs */}
          {(selectedAction === 'approve' || selectedAction === 'schedule_payment') && (
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
              <label className="text-xs font-semibold text-emerald-900 block">
                {b('Approved Payout Amount (₹ INR)', 'ಅನುಮೋದಿತ ಪರಿಹಾರ ಮೊತ್ತ (ರೂ.)', language)}
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-slate-800">₹</span>
                <input
                  type="number"
                  value={approvedAmount}
                  onChange={e => setApprovedAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-emerald-400 rounded-xl px-4 py-2 text-lg font-bold text-emerald-800 font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <span className="text-[11px] text-slate-600 block">
                {b('Recommended Indicative Baseline:', 'ಶಿಫಾರಸು ಮಾಡಿದ ಮೂಲ ಮೊತ್ತ:', language)} ₹{claim.estimated_payout.toLocaleString('en-IN')} ({b('Sum Insured Cap:', 'ವಿಮಾ ಗರಿಷ್ಠ ಮಿತಿ:', language)} ₹{claim.crop.sum_insured.toLocaleString('en-IN')})
              </span>
            </div>
          )}

          {selectedAction === 'reject' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-red-900 block">
                {b('Mandatory Rejection Justification', 'ತಿರಸ್ಕರಣೆಯ ಕಡ್ಡಾಯ ಕಾರಣ', language)}
              </label>
              <textarea
                required
                rows={2}
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder={b('State specific policy clause or contradictory satellite data...', 'ನಿರ್ದಿಷ್ಟ ಪಾಲಿಸಿ ನಿಯಮ ಅಥವಾ ಉಪಗ್ರಹ ಸಾಕ್ಷ್ಯದ ವಿರೋಧಾಭಾಸವನ್ನು ನಮೂದಿಸಿ...', language)}
                className="w-full bg-white border border-red-300 rounded-xl p-3 text-slate-900 text-xs outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
            </div>
          )}

          {selectedAction === 'request_evidence' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-amber-900 block">
                {b('Specific Evidence Requested from Farmer', 'ರೈತರಿಂದ ಕೋರಲಾದ ನಿರ್ದಿಷ್ಟ ಪುರಾವೆ', language)}
              </label>
              <textarea
                required
                rows={2}
                value={requestedEvidence}
                onChange={e => setRequestedEvidence(e.target.value)}
                placeholder={b('E.g., Please upload close-up photos of root rot, or updated canal water discharge certificate...', 'ಉದಾ: ಬೇರು ಕೊಳೆತದ ಫೋಟೋಗಳು ಅಥವಾ ಕಾಲುವೆ ನೀರು ಹರಿವಿನ ಪ್ರಮಾಣಪತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ...', language)}
                className="w-full bg-white border border-amber-300 rounded-xl p-3 text-slate-900 text-xs outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          )}

          {/* Reviewer Comments */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              {b('Official Reviewer Comments & Audit Notes', 'ಅಧಿಕೃತ ವಿಮರ್ಶಕರ ಟಿಪ್ಪಣಿಗಳು', language)}
            </label>
            <textarea
              rows={2}
              value={comments}
              onChange={e => setComments(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 text-xs outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* Reviewer Identity */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-600 block mb-1">{b('Reviewer Name', 'ವಿಮರ್ಶಕರ ಹೆಸರು', language)}</label>
              <input
                type="text"
                value={reviewerName}
                onChange={e => setReviewerName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-600 block mb-1">{b('Employee ID', 'ನೌಕರರ ಐಡಿ', language)}</label>
              <input
                type="text"
                value={reviewerId}
                onChange={e => setReviewerId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              {b('Cancel', 'ರದ್ದುಗೊಳಿಸಿ', language)}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer disabled:opacity-50"
            >
              {submitting ? b('Broadcasting Decision...', 'ತೀರ್ಪು ಪ್ರಸಾರ ಮಾಡಲಾಗುತ್ತಿದೆ...', language) : b('Commit & Notify Farmer Instantly', 'ತೀರ್ಪು ಖಚಿತಪಡಿಸಿ & ರೈತರಿಗೆ ತಕ್ಷಣ ತಿಳಿಸಿ', language)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
