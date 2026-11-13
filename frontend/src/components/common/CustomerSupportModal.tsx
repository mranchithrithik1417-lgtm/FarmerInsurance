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
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn"
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
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="shrink-0 p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-500/10 shrink-0">
              <PhoneCall className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="customer-support-title" className="text-base sm:text-lg font-black text-white">
                  {language === 'kn' ? 'ರೈತ ಗ್ರಾಹಕ ಸಹಾಯವಾಣಿ' : 'Farmer Customer Support'}
                </h3>
                <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                  24/7 ACTIVE
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400">
                {language === 'kn'
                  ? 'ಯಾವುದೇ ಸಹಾಯಕ್ಕಾಗಿ ನಮ್ಮ ತಾಂತ್ರಿಕ ತಂಡ ಲಭ್ಯವಿದೆ'
                  : 'Official PMFBY & Bhoomi Land Records Helpdesk'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer shrink-0"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable and contained */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* Main Direct Call Card with 9019715931 */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-950/60 via-slate-950 to-slate-900 border-2 border-emerald-500/60 shadow-xl space-y-3 sm:space-y-4 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold font-mono">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>DIRECT FARMER HELPLINE</span>
            </div>

            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                {language === 'kn' ? 'ನೇರ ಸಂಪರ್ಕ ಸಂಖ್ಯೆ' : 'Call Support Officer Directly'}
              </div>
              <a
                href={`tel:${supportNumber}`}
                className="text-2xl sm:text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 font-mono tracking-tight block mt-1 hover:scale-105 transition-transform"
              >
                {supportNumberFormatted}
              </a>
              <div className="text-[11px] text-slate-400 mt-1">
                Toll-free routing • Senior Agronomist on call
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <a
                href={`tel:${supportNumber}`}
                className="px-4 py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Phone className="w-4 h-4 text-white" />
                <span>Call: {supportNumber}</span>
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 sm:py-3 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl text-xs font-bold border border-emerald-500/30 flex items-center justify-center gap-2 transition hover:border-emerald-500 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Instant Callback Option */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Request Instant Officer Callback</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                We will call your registered number (<strong className="text-slate-200">+91 {farmerMobile}</strong>) in 5 mins.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRequestCallback}
              disabled={callbackRequested}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
                callbackRequested
                  ? 'bg-emerald-500 text-slate-950 font-black'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              {callbackRequested ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                  <span>Callback Requested!</span>
                </>
              ) : (
                <span>Request Callback</span>
              )}
            </button>
          </div>

          {/* Common Help Topics & FAQs for Farmers */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'kn' ? 'ಸಹಾಯ ವಿಷಯಗಳು ಮತ್ತು ಪ್ರಶ್ನೋತ್ತರ' : 'Help Topics & FAQs'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Find Your ULPIN</div>
                  <div className="text-[11px] text-slate-400">Search Bhoomi records by name, district, and village.</div>
                </div>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-start gap-2.5">
                <Layers className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Satellite Land Map</div>
                  <div className="text-[11px] text-slate-400">Help dragging corner pins to align with your farm bunds.</div>
                </div>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-start gap-2.5">
                <Camera className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">GeoCamera Evidence</div>
                  <div className="text-[11px] text-slate-400">Capturing geotagged photos of flooded or damaged crops.</div>
                </div>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-start gap-2.5">
                <FileText className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Claim Settlement</div>
                  <div className="text-[11px] text-slate-400">PMFBY scale of finance and DBT payout tracking.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="shrink-0 p-3.5 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="truncate max-w-[200px] sm:max-w-none">KisanClaim Support Cell • 9019715931</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
