import React from 'react';
import { X, Printer, Download, ExternalLink, ShieldCheck } from 'lucide-react';
import { Claim } from '../../types';
import { b, t } from '../../utils/translations';

interface Props {
  claim: Claim | null;
  isOpen: boolean;
  language?: 'en' | 'kn';
  onClose: () => void;
}

export const ReportViewerModal: React.FC<Props> = ({ claim, isOpen, language = 'en', onClose }) => {
  if (!isOpen || !claim) return null;

  const htmlUrl = `/api/claims/${claim.id}/report.html`;
  const pdfUrl = `/api/claims/${claim.id}/report.pdf`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl h-[92vh] bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Top Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {b('KisanClaim Verification Dossier', 'ಕಿಸಾನ್‌ಕ್ಲೇಮ್ ಪರಿಶೀಲನಾ ಕಡತ', language)}
                </h3>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {claim.claim_number}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                {b('Official Multi-Page Satellite & Meteorological Evidence Report', 'ಅಧಿಕೃತ ಬಹುಪುಟ ಉಪಗ್ರಹ & ಹವಾಮಾನ ಸಾಕ್ಷ್ಯ ವರದಿ', language)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 flex items-center gap-1.5 transition shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">{b('Open in Tab', 'ಹೊಸ ಟ್ಯಾಬ್‌ನಲ್ಲಿ ವೀಕ್ಷಿಸಿ', language)}</span>
            </a>

            <a
              href={pdfUrl}
              download={`KisanClaim_${claim.claim_number}.pdf`}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{b('Download PDF', 'ಪಿಡಿಎಫ್ ಡೌನ್‌ಲೋಡ್', language)}</span>
            </a>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition ml-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Preview iFrame */}
        <div className="flex-1 bg-white">
          <iframe
            src={htmlUrl}
            title={`Report for ${claim.claim_number}`}
            className="w-full h-full border-none"
          />
        </div>
      </div>
    </div>
  );
};
