import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Phone,
  PhoneCall,
  MessageSquare,
  X,
  HelpCircle,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Sparkles,
  MapPin,
  Camera,
  Layers,
  FileText
} from 'lucide-react';
import { playChime } from '../../utils/speech';
import { b } from '../../utils/translations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language?: 'en' | 'kn';
  farmerName?: string;
  farmerMobile?: string;
}

export const CustomerSupportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  language = 'en',
  farmerName = 'Ravi Kumar',
  farmerMobile = '9876543210'
}) => {
  const [callbackRequested, setCallbackRequested] = useState<boolean>(false);
  const supportNumber = '9019715931';
  const supportNumberFormatted = '+91 9019715931';

  // Handle ESC key and lock body scrolling when open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  const handleRequestCallback = () => {
    setCallbackRequested(true);
    playChime('success');
    setTimeout(() => {
      setCallbackRequested(false);
    }, 6000);
  };

  const whatsappUrl = `https://wa.me/91${supportNumber}?text=${encodeURIComponent(
    `Namaste KisanClaim Support! My name is ${farmerName} (Mobile: ${farmerMobile}). I need assistance with my PMFBY crop damage claim and land verification.`
  )}`;

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="customer-support-title"
    >
      <div
        className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="shrink-0 p-4 sm:p-5 bg-gradient-to-r from-emerald-800 via-green-800 to-emerald-900 border-b border-emerald-900 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/15 text-white border border-white/20 flex items-center justify-center shadow-sm shrink-0">
              <PhoneCall className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="customer-support-title" className="text-base sm:text-lg font-black text-white">
                  {b('Farmer Customer Support', 'ರೈತ ಗ್ರಾಹಕ ಸಹಾಯವಾಣಿ', language)}
                </h3>
                <span className="text-[10px] font-mono font-bold bg-white/20 text-emerald-100 border border-white/30 px-2 py-0.5 rounded-full">
                  24/7 ACTIVE
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-emerald-100">
                {b(
                  'Official PMFBY & Bhoomi Land Records Helpdesk',
                  'ಅಧಿಕೃತ PMFBY ಮತ್ತು ಭೂಮಿ ದಾಖಲೆಗಳ ಸಹಾಯ ಕೇಂದ್ರ',
                  language
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer shrink-0"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable and contained */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4 sm:space-y-5 bg-slate-50/50">
          {/* Main Direct Call Card with 9019715931 */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-green-50/70 border-2 border-emerald-400 shadow-sm space-y-3 sm:space-y-4 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-mono border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>{b('DIRECT FARMER HELPLINE', 'ರೈತ ನೇರ ಸಹಾಯವಾಣಿ', language)}</span>
            </div>

            <div>
              <div className="text-xs text-slate-600 uppercase tracking-wider font-semibold">
                {b('Call Support Officer Directly', 'ಸಹಾಯ ಅಧಿಕಾರಿಗೆ ನೇರವಾಗಿ ಕರೆ ಮಾಡಿ', language)}
              </div>
              <a
                href={`tel:${supportNumber}`}
                className="text-2xl sm:text-3xl md:text-4xl font-black text-emerald-800 font-mono tracking-tight block mt-1 hover:scale-105 transition-transform"
              >
                {supportNumberFormatted}
              </a>
              <div className="text-[11px] text-slate-500 mt-1">
                {b('Toll-free routing • Senior Agronomist on call', 'ಶುಲ್ಕ ರಹಿತ ಕರೆ ಮಾರ್ಗ • ಹಿರಿಯ ಕೃಷಿ ತಜ್ಞರು ಲಭ್ಯ', language)}
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <a
                href={`tel:${supportNumber}`}
                className="px-4 py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Phone className="w-4 h-4 text-white" />
                <span>{b('Call', 'ಕರೆ ಮಾಡಿ', language)}: {supportNumber}</span>
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 sm:py-3 bg-white hover:bg-slate-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-300 flex items-center justify-center gap-2 shadow-xs transition hover:border-emerald-500 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-emerald-700" />
                <span>{b('Chat on WhatsApp', 'ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಚಾಟ್ ಮಾಡಿ', language)}</span>
              </a>
            </div>
          </div>

          {/* Instant Callback Option */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-700" />
                <span>{b('Request Instant Officer Callback', 'ಅಧಿಕಾರಿಯಿಂದ ತಕ್ಷಣ ಮರುಕರೆ ಕೋರಿ', language)}</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                {b(
                  `We will call your registered number (+91 ${farmerMobile}) in 5 mins.`,
                  `ನಿಮ್ಮ ನೋಂದಾಯಿತ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಗೆ (+91 ${farmerMobile}) 5 ನಿಮಿಷಗಳಲ್ಲಿ ಕರೆ ಮಾಡುತ್ತೇವೆ.`,
                  language
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={handleRequestCallback}
              disabled={callbackRequested}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
                callbackRequested
                  ? 'bg-emerald-600 text-white font-black'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
              }`}
            >
              {callbackRequested ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  <span>{b('Callback Requested!', 'ಮರುಕರೆ ಕೋರಲಾಗಿದೆ!', language)}</span>
                </>
              ) : (
                <span>{b('Request Callback', 'ಮರುಕರೆ ಕೋರಿ', language)}</span>
              )}
            </button>
          </div>

          {/* Common Help Topics & FAQs for Farmers */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-slate-600 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
              <span>{b('Help Topics & FAQs', 'ಸಹಾಯ ವಿಷಯಗಳು ಮತ್ತು FAQ ಗಳು', language)}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-start gap-2.5 shadow-xs">
                <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">{b('Find Your ULPIN', 'ನಿಮ್ಮ ULPIN ಹುಡುಕಿ', language)}</div>
                  <div className="text-[11px] text-slate-500">
                    {b('Search Bhoomi records by name, district, and village.', 'ಹೆಸರು, ಜಿಲ್ಲೆ ಮತ್ತು ಗ್ರಾಮದ ಮೂಲಕ ಭೂಮಿ ದಾಖಲೆಗಳನ್ನು ಹುಡುಕಿ.', language)}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-start gap-2.5 shadow-xs">
                <Layers className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">{b('Satellite Land Map', 'ಉಪಗ್ರಹ ಭೂಮಿ ನಕ್ಷೆ', language)}</div>
                  <div className="text-[11px] text-slate-500">
                    {b('Help dragging corner pins to align with your farm bunds.', 'ಜಮೀನಿನ ಬದುಗಳಿಗೆ ತಕ್ಕಂತೆ ಪಿನ್‌ಗಳನ್ನು ಎಳೆಯಲು ಸಹಾಯ.', language)}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-start gap-2.5 shadow-xs">
                <Camera className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">{b('GeoCamera Evidence', 'ಜಿಯೋ-ಕ್ಯಾಮೆರಾ ಪುರಾವೆ', language)}</div>
                  <div className="text-[11px] text-slate-500">
                    {b('Capturing geotagged photos of flooded or damaged crops.', 'ನೀರು ನಿಂತ ಅಥವಾ ಹಾನಿಗೊಳಗಾದ ಬೆಳೆಗಳ ಫೋಟೋಗಳನ್ನು ಸೆರೆಹಿಡಿಯುವುದು.', language)}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-start gap-2.5 shadow-xs">
                <FileText className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">{b('Claim Settlement', 'ಕ್ಲೈಮ್ ಇತ್ಯರ್ಥ', language)}</div>
                  <div className="text-[11px] text-slate-500">
                    {b('PMFBY scale of finance and DBT payout tracking.', 'PMFBY ಆರ್ಥಿಕ ಮಾನದಂಡ ಮತ್ತು DBT ಪಾವತಿ ಪರಿಶೀಲನೆ.', language)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="shrink-0 p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span className="truncate max-w-[200px] sm:max-w-none font-medium">
              {b('KisanClaim Support Cell • 9019715931', 'ಕಿಸಾನ್‌ಕ್ಲೇಮ್ ಸಹಾಯವಾಣಿ ಕೋಶ • 9019715931', language)}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold cursor-pointer"
          >
            {b('Close', 'ಮುಚ್ಚಿ', language)}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
