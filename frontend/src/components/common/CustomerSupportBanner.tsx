import React, { useState } from 'react';
import { Phone, PhoneCall, MessageSquare, HelpCircle, ShieldAlert, Sparkles, ChevronRight } from 'lucide-react';
import { CustomerSupportModal } from './CustomerSupportModal';

interface Props {
  language?: 'en' | 'kn';
  farmerName?: string;
  farmerMobile?: string;
  contextText?: string;
  compact?: boolean;
}

export const CustomerSupportBanner: React.FC<Props> = ({
  language = 'en',
  farmerName = 'Ravi Kumar',
  farmerMobile = '9876543210',
  contextText,
  compact = false
}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const supportNumber = '9019715931';
  const supportNumberFormatted = '+91 9019715931';

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/90 via-slate-900 to-teal-950/80 border border-emerald-500/40 p-3 sm:p-4 shadow-lg">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
          {/* Left: Support Call Center Icon & Text */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 flex items-center justify-center font-black shadow-md shadow-emerald-500/20 shrink-0">
              <PhoneCall className="w-5 h-5 animate-pulse text-slate-950" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black text-white tracking-tight flex items-center gap-1.5">
                  <span>{language === 'kn' ? 'ರೈತರ ಗ್ರಾಹಕ ಸಹಾಯವಾಣಿ' : 'Farmer Customer Support Helpline'}</span>
                </span>
                <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full whitespace-nowrap">
                  24/7 HELPDESK
                </span>
              </div>
              <p className="text-xs text-slate-300/90 mt-0.5">
                {contextText ||
                  (language === 'kn'
                    ? 'ಯಾವುದೇ ಹಂತದಲ್ಲಿ ಸಹಾಯ ಬೇಕಾದಲ್ಲಿ ನೇರವಾಗಿ ಕರೆ ಮಾಡಿ ಅಥವಾ WhatsApp ಮೂಲಕ ಸಂಪರ್ಕಿಸಿ.'
                    : 'Need help with ULPIN recovery, satellite land boundary selection, or filing your damage claim?')}
              </p>
            </div>
          </div>

          {/* Right: Call & Details Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Direct Dial Button */}
            <a
              href={`tel:${supportNumber}`}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition transform hover:-translate-y-0.5 cursor-pointer"
              title="Click to dial customer support immediately"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call: {supportNumber}</span>
            </a>

            {/* View Full Support Options Modal */}
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Help & FAQ</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <CustomerSupportModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          language={language}
          farmerName={farmerName}
          farmerMobile={farmerMobile}
        />
      )}
    </>
  );
};
