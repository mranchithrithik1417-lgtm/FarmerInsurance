import React from 'react';
import { X, Download, ExternalLink, ShieldCheck } from 'lucide-react';
import { Claim } from '../../types';
import { b } from '../../utils/translations';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-5xl h-[92vh] bg-[#090D16] border border-slate-800 rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col">
        {/* Modal Top Bar */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/30">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {b('KisanClaim Verification Dossier', 'ಕಿಸಾನ್‌ಕ್ಲೇಮ್ ಪರಿಶೀಲನಾ ಕಡತ', language)}
                </h3>
                <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                  {claim.claim_number}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {b('Official Multi-Page Satellite & Meteorological Evidence Report', 'ಅಧಿಕೃತ ಬಹುಪುಟ ಉಪಗ್ರಹ & ಹವಾಮಾನ ಸಾಕ್ಷ್ಯ ವರದಿ', language)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold rounded-xl border border-slate-700/80 flex items-center gap-1.5 transition shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">{b('Open in Tab', 'ಹೊಸ ಟ್ಯಾಬ್‌ನಲ್ಲಿ ವೀಕ್ಷಿಸಿ', language)}</span>
            </a>

            <a
              href={pdfUrl}
              download={`KisanClaim_${claim.claim_number}.pdf`}
              className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{b('Download PDF', 'ಪಿಡಿಎಫ್ ಡೌನ್‌ಲೋಡ್', language)}</span>
            </a>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition ml-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Preview iFrame */}
        <div className="flex-1 bg-white rounded-b-3xl overflow-hidden">
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
