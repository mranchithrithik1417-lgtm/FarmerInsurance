import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Phone,
  Building2,
  KeyRound,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Send,
  Globe,
  Check,
  Layers
} from 'lucide-react';
import { UserSession } from '../../types';
import {
  sendFarmerOTP,
  verifyFarmerOTP,
  sendInsurerOTP,
  verifyInsurerOTP
} from '../../services/api';
import { b, t } from '../../utils/translations';

interface Props {
  onLoginSuccess: (session: UserSession) => void;
  language: 'en' | 'kn';
  onLanguageChange: (lang: 'en' | 'kn') => void;
}

export const AuthPage: React.FC<Props> = ({
  onLoginSuccess,
  language,
  onLanguageChange
}) => {
  // ==============================================================
  // FARMER LOGIN STATE
  // ==============================================================
  const [farmerMobile, setFarmerMobile] = useState<string>('9876543210');
  const [farmerOtp, setFarmerOtp] = useState<string>('');
  const [farmerOtpSent, setFarmerOtpSent] = useState<boolean>(false);
  const [farmerSendingOtp, setFarmerSendingOtp] = useState<boolean>(false);
  const [farmerVerifyingOtp, setFarmerVerifyingOtp] = useState<boolean>(false);
  const [farmerError, setFarmerError] = useState<string | null>(null);
  const [farmerSuccessMsg, setFarmerSuccessMsg] = useState<string | null>(null);
  const [farmerDemoOtp, setFarmerDemoOtp] = useState<string | null>(null);
  const [farmerTimer, setFarmerTimer] = useState<number>(0);

  // ==============================================================
  // INSURER LOGIN STATE
  // ==============================================================
  const [companyId, setCompanyId] = useState<string>('AGRI-INS-409');
  const [insurerMobile, setInsurerMobile] = useState<string>('9812345678');
  const [insurerOtp, setInsurerOtp] = useState<string>('');
  const [insurerOtpSent, setInsurerOtpSent] = useState<boolean>(false);
  const [insurerSendingOtp, setInsurerSendingOtp] = useState<boolean>(false);
  const [insurerVerifyingOtp, setInsurerVerifyingOtp] = useState<boolean>(false);
  const [insurerError, setInsurerError] = useState<string | null>(null);
  const [insurerSuccessMsg, setInsurerSuccessMsg] = useState<string | null>(null);
  const [insurerDemoOtp, setInsurerDemoOtp] = useState<string | null>(null);
  const [insurerTimer, setInsurerTimer] = useState<number>(0);

  // Countdown timers for resend
  useEffect(() => {
    let t: any;
    if (farmerTimer > 0) {
      t = setTimeout(() => setFarmerTimer(farmerTimer - 1), 1000);
    }
    return () => clearTimeout(t);
  }, [farmerTimer]);

  useEffect(() => {
    let t: any;
    if (insurerTimer > 0) {
      t = setTimeout(() => setInsurerTimer(insurerTimer - 1), 1000);
    }
    return () => clearTimeout(t);
  }, [insurerTimer]);

  // ==============================================================
  // FARMER OTP HANDLERS
  // ==============================================================
  const handleFarmerSendOTP = async () => {
    setFarmerError(null);
    setFarmerSuccessMsg(null);
    setFarmerDemoOtp(null);

    const cleanMob = farmerMobile.trim().replace(/\D/g, '');
    if (cleanMob.length !== 10) {
      setFarmerError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setFarmerSendingOtp(true);
    try {
      const res = await sendFarmerOTP(cleanMob);
      setFarmerOtpSent(true);
      setFarmerSuccessMsg(res.message || `OTP dispatched to +91 XXXXXX${cleanMob.slice(-4)}`);
      if (res.demo_otp) {
        setFarmerDemoOtp(res.demo_otp);
        setFarmerOtp(res.demo_otp);
      }
      setFarmerTimer(30);
    } catch (err: any) {
      setFarmerError(err.message || 'Failed to dispatch OTP. Please verify mobile number.');
    } finally {
      setFarmerSendingOtp(false);
    }
  };

  const handleFarmerVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setFarmerError(null);
    setFarmerSuccessMsg(null);

    const cleanMob = farmerMobile.trim().replace(/\D/g, '');
    const cleanOtp = farmerOtp.trim();

    if (cleanMob.length !== 10) {
      setFarmerError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!cleanOtp) {
      setFarmerError('Please enter the verification OTP.');
      return;
    }

    setFarmerVerifyingOtp(true);
    try {
      const session = await verifyFarmerOTP(cleanMob, cleanOtp);
      setFarmerSuccessMsg('OTP verified successfully! Redirecting to Land Identification...');
      setTimeout(() => {
        onLoginSuccess(session);
      }, 400);
    } catch (err: any) {
      setFarmerError(err.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setFarmerVerifyingOtp(false);
    }
  };

  // ==============================================================
  // INSURER OTP HANDLERS
  // ==============================================================
  const handleInsurerSendOTP = async () => {
    setInsurerError(null);
    setInsurerSuccessMsg(null);
    setInsurerDemoOtp(null);

    const cid = companyId.trim().toUpperCase();
    const cleanMob = insurerMobile.trim().replace(/\D/g, '');

    if (!cid) {
      setInsurerError('Please enter your authorized Insurance Company ID.');
      return;
    }

    if (cleanMob.length !== 10) {
      setInsurerError('Please enter a valid 10-digit officer mobile number.');
      return;
    }

    setInsurerSendingOtp(true);
    try {
      const res = await sendInsurerOTP(cid, cleanMob);
      setInsurerOtpSent(true);
      setInsurerSuccessMsg(res.message || `Officer OTP sent for ${cid}`);
      if (res.demo_otp) {
        setInsurerDemoOtp(res.demo_otp);
        setInsurerOtp(res.demo_otp);
      }
      setInsurerTimer(30);
    } catch (err: any) {
      setInsurerError(err.message || 'Failed to dispatch officer OTP. Verify credentials.');
    } finally {
      setInsurerSendingOtp(false);
    }
  };

  const handleInsurerVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setInsurerError(null);
    setInsurerSuccessMsg(null);

    const cid = companyId.trim().toUpperCase();
    const cleanMob = insurerMobile.trim().replace(/\D/g, '');
    const cleanOtp = insurerOtp.trim();

    if (!cid) {
      setInsurerError('Company ID is required.');
      return;
    }

    if (cleanMob.length !== 10) {
      setInsurerError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!cleanOtp) {
      setInsurerError('Please enter the officer verification OTP.');
      return;
    }

    setInsurerVerifyingOtp(true);
    try {
      const session = await verifyInsurerOTP(cid, cleanMob, cleanOtp);
      setInsurerSuccessMsg('Officer authenticated! Loading Insurance Adjudication Console...');
      setTimeout(() => {
        onLoginSuccess(session);
      }, 400);
    } catch (err: any) {
      setInsurerError(err.message || 'Invalid officer OTP entered. Please try again.');
    } finally {
      setInsurerVerifyingOtp(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-black relative overflow-hidden font-sans agri-bg-mesh">
      {/* Deep space orbital grid & ambient halos */}
      <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_0.75px,transparent_0.75px)] [background-size:28px_28px] opacity-[0.06] pointer-events-none" />
      <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* ============================================================== */}
      {/* 1. TOP HEADER WITH OFFICIAL KISANCLAIM LOGO                    */}
      {/* ============================================================== */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          {/* Official Logo Symbol */}
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-indigo-600 text-white shadow-[0_0_24px_rgba(6,182,212,0.4)] text-2xl font-black ring-1 ring-cyan-400/40">
            🌾
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-white">
                Kisan<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-300">Claim</span>
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-cyan-950/70 text-cyan-300 border border-cyan-500/40 px-2.5 py-0.5 rounded-full font-mono shadow-[0_0_12px_rgba(6,182,212,0.15)]">
                PMFBY TELEMETRY
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {b('National AI-Powered Crop Damage Evidence & Insurance Verification', 'ರಾಷ್ಟ್ರೀಯ ಎಐ ಆಧಾರಿತ ಬೆಳೆ ಹಾನಿ ಪುರಾವೆ ಮತ್ತು ವಿಮಾ ಪರಿಶೀಲನಾ ವೇದಿಕೆ', language)}
            </p>
          </div>
        </div>

        {/* Language Selector Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl p-1 shadow-sm backdrop-blur-md">
          <Globe className="w-4 h-4 text-cyan-400 ml-1.5" />
          <button
            type="button"
            onClick={() => onLanguageChange('en')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
              language === 'en'
                ? 'bg-cyan-600 text-white shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange('kn')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
              language === 'kn'
                ? 'bg-cyan-600 text-white shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ಕನ್ನಡ
          </button>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. MAIN LOGIN CONTAINER: TWO SEPARATE CARDS ON THE SAME PAGE   */}
      {/* ============================================================== */}
      <main className="relative z-10 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 flex flex-col justify-center">
        {/* Banner Tagline */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-bold mb-3 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>{b('Secure Role-Based Agricultural Insurance Access', 'ಸುರಕ್ಷಿತ ಪಾತ್ರ-ಆಧಾರಿತ ಕೃಷಿ ವಿಮಾ ಪ್ರವೇಶ', language)}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            {b('Sign In to KisanClaim', 'ಕಿಸಾನ್‌ಕ್ಲೇಮ್‌ಗೆ ಸೈನ್ ಇನ್ ಮಾಡಿ', language)}
          </h1>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            {b(
              'Select your portal below. Farmers authenticate via Mobile OTP to access the ULPIN Cadastral Dashboard. Insurers authenticate via Company ID & Officer OTP to access the Claim Adjudication Console.',
              'ಕೆಳಗೆ ನಿಮ್ಮ ಪೋರ್ಟಲ್ ಆಯ್ಕೆಮಾಡಿ. ರೈತರು ULPIN ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗಾಗಿ ಮೊಬೈಲ್ OTP ಬಳಸಿ ಲಾಗಿನ್ ಆಗಬಹುದು. ವಿಮಾ ಅಧಿಕಾರಿಗಳು ಕಂಪನಿ ಐಡಿ & OTP ಬಳಸಿ ಲಾಗಿನ್ ಆಗಬಹುದು.',
              language
            )}
          </p>
        </div>

        {/* TWO SEPARATED CARDS ON THE SAME PAGE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* ============================================================ */}
          {/* CARD 1: FARMER LOGIN                                         */}
          {/* ============================================================ */}
          <div className="relative rounded-3xl bg-slate-900/80 border border-cyan-500/30 hover:border-cyan-500/60 p-6 sm:p-8 flex flex-col justify-between shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-300">
            {/* Card Header Badge */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-cyan-950/60 text-cyan-400 rounded-2xl border border-cyan-500/30">
                  <span className="text-2xl">🌾</span>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-white">{b('Farmer Login', 'ರೈತರ ಲಾಗಿನ್', language)}</h2>
                  <p className="text-xs text-cyan-400 font-medium">{b('Bhu-Aadhaar & ULPIN Portal', 'ಭೂ-ಆಧಾರ್ & ULPIN ಪೋರ್ಟಲ್', language)}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-cyan-950/80 text-cyan-300 text-[10px] font-extrabold uppercase tracking-wider border border-cyan-500/40 font-mono">
                {b('ROLE: FARMER', 'ಪಾತ್ರ: ರೈತರು', language)}
              </span>
            </div>

            {/* Farmer Form */}
            <form onSubmit={handleFarmerVerifyOTP} className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Mobile Number Input Field */}
                <div>
                  <label htmlFor="farmer-mobile" className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{b('Mobile Number', 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ', language)}</span>
                    </span>
                    <span className="text-[10px] text-cyan-400 font-mono font-bold">10 DIGITS</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-mono text-sm font-semibold">
                        +91
                      </div>
                      <input
                        id="farmer-mobile"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        maxLength={10}
                        required
                        value={farmerMobile}
                        onChange={(e) => {
                          setFarmerMobile(e.target.value.replace(/\D/g, ''));
                          setFarmerError(null);
                        }}
                        placeholder="9876543210"
                        className="w-full bg-slate-950/80 border border-slate-700 focus:bg-slate-900 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 rounded-xl pl-12 pr-4 py-2.5 sm:py-3 text-white text-sm font-mono tracking-wider transition outline-none"
                      />
                    </div>

                    {/* Send OTP Button */}
                    <button
                      type="button"
                      disabled={farmerSendingOtp || farmerMobile.trim().length !== 10 || farmerTimer > 0}
                      onClick={handleFarmerSendOTP}
                      className="px-4 py-2.5 sm:py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer shrink-0"
                    >
                      {farmerSendingOtp ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>{farmerTimer > 0 ? `${b('Resend', 'ಮರುಕಳುಹಿಸಿ', language)} (${farmerTimer}s)` : b('Send OTP', 'OTP ಕಳುಹಿಸಿ', language)}</span>
                    </button>
                  </div>
                </div>

                {/* OTP Input Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="farmer-otp" className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{b('Enter OTP Code', 'OTP ಕೋಡ್ ನಮೂದಿಸಿ', language)}</span>
                    </label>
                    {farmerDemoOtp && (
                      <span className="text-[11px] font-mono text-cyan-300 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40">
                        ⚡ {b('Demo OTP:', 'ಡೆಮೊ OTP:', language)} {farmerDemoOtp}
                      </span>
                    )}
                  </div>
                  <input
                    id="farmer-otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    required
                    value={farmerOtp}
                    onChange={(e) => {
                      setFarmerOtp(e.target.value.replace(/\D/g, ''));
                      setFarmerError(null);
                    }}
                    placeholder={b('Enter 4 or 6 digit OTP', '೪ ಅಥವಾ ೬ ಅಂಕಿಯ OTP ನಮೂದಿಸಿ', language)}
                    className="w-full bg-slate-950/80 border border-slate-700 focus:bg-slate-900 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 rounded-xl px-4 py-2.5 sm:py-3 text-white text-base font-mono tracking-widest text-center placeholder:text-sm placeholder:text-slate-500 placeholder:tracking-normal transition outline-none"
                  />
                </div>

                {/* Quick Demo Fill Pill */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setFarmerMobile('9876543210');
                      setFarmerError(null);
                    }}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium underline flex items-center gap-1 cursor-pointer font-mono"
                  >
                    <span>⚡ {b('Quick-fill: 9876543210 (Ravi Kumar - Karnataka)', 'ತ್ವರಿತ-ಭರ್ತಿ: 9876543210 (ರವಿ ಕುಮಾರ್ - ಕರ್ನಾಟಕ)', language)}</span>
                  </button>
                </div>

                {/* Error Banner */}
                {farmerError && (
                  <div className="p-3 bg-rose-950/50 border border-rose-800/60 rounded-xl text-rose-300 text-xs flex items-center gap-2 animate-shake">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{farmerError}</span>
                  </div>
                )}

                {/* Success Banner */}
                {farmerSuccessMsg && (
                  <div className="p-3 bg-cyan-950/50 border border-cyan-500/40 rounded-xl text-cyan-300 text-xs flex items-center gap-2 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-cyan-400" />
                    <span>{farmerSuccessMsg}</span>
                  </div>
                )}
              </div>

              {/* Verify OTP Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={farmerVerifyingOtp || !farmerOtp}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(6,182,212,0.35)] flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  {farmerVerifyingOtp ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{b('Verifying Farmer OTP...', 'ರೈತರ OTP ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...', language)}</span>
                    </>
                  ) : (
                    <>
                      <span>{b('Verify OTP & Open Farmer Dashboard', 'OTP ಪರಿಶೀಲಿಸಿ & ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯಿರಿ', language)}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-[11px] text-slate-400 text-center mt-2.5">
                  {b('Redirects to land parcel identification & ULPIN linking', 'ಭೂಮಿ ಗುರುತಿಸುವಿಕೆ ಮತ್ತು ULPIN ಲಿಂಕ್‌ಗೆ ತೆರಳುತ್ತದೆ', language)}
                </p>
              </div>
            </form>
          </div>

          {/* ============================================================ */}
          {/* CARD 2: INSURER LOGIN                                        */}
          {/* ============================================================ */}
          <div className="relative rounded-3xl bg-slate-900/80 border border-indigo-500/30 hover:border-indigo-500/60 p-6 sm:p-8 flex flex-col justify-between shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-300">
            {/* Card Header Badge */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-950/60 text-indigo-400 rounded-2xl border border-indigo-500/30">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-white">{b('Insurer Login', 'ವಿಮಾಧಿಕಾರಿ ಲಾಗಿನ್', language)}</h2>
                  <p className="text-xs text-indigo-400 font-medium">{b('PMFBY Adjudication Console', 'PMFBY ತೀರ್ಪು ನೀಡಿಕೆ ಕನ್ಸೋಲ್', language)}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-indigo-950/80 text-indigo-300 text-[10px] font-extrabold uppercase tracking-wider border border-indigo-500/40 font-mono">
                {b('ROLE: INSURER', 'ಪಾತ್ರ: ವಿಮಾಧಿಕಾರಿ', language)}
              </span>
            </div>

            {/* Insurer Form */}
            <form onSubmit={handleInsurerVerifyOTP} className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Company ID Input Field */}
                <div>
                  <label htmlFor="company-id" className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{b('Company ID', 'ಕಂಪನಿ ಐಡಿ', language)}</span>
                    </span>
                    <span className="text-[10px] text-indigo-400 font-mono font-bold">{b('OFFICIAL ID', 'ಅಧಿಕೃತ ಐಡಿ', language)}</span>
                  </label>
                  <input
                    id="company-id"
                    type="text"
                    required
                    value={companyId}
                    onChange={(e) => {
                      setCompanyId(e.target.value.toUpperCase());
                      setInsurerError(null);
                    }}
                    placeholder={b('e.g. AGRI-INS-409', 'ಉದಾ: AGRI-INS-409', language)}
                    className="w-full bg-slate-950/80 border border-slate-700 focus:bg-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-4 py-2.5 sm:py-3 text-white text-sm font-mono tracking-wider transition outline-none"
                  />
                </div>

                {/* Mobile Number Input Field */}
                <div>
                  <label htmlFor="insurer-mobile" className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{b('Officer Mobile Number', 'ಅಧಿಕಾರಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ', language)}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{b('10 DIGITS', '೧೦ ಅಂಕಿಗಳು', language)}</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-mono text-sm font-semibold">
                        +91
                      </div>
                      <input
                        id="insurer-mobile"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        maxLength={10}
                        required
                        value={insurerMobile}
                        onChange={(e) => {
                          setInsurerMobile(e.target.value.replace(/\D/g, ''));
                          setInsurerError(null);
                        }}
                        placeholder="9812345678"
                        className="w-full bg-slate-950/80 border border-slate-700 focus:bg-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl pl-12 pr-4 py-2.5 sm:py-3 text-white text-sm font-mono tracking-wider transition outline-none"
                      />
                    </div>

                    {/* Send OTP Button */}
                    <button
                      type="button"
                      disabled={insurerSendingOtp || insurerMobile.trim().length !== 10 || insurerTimer > 0}
                      onClick={handleInsurerSendOTP}
                      className="px-4 py-2.5 sm:py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-[0_0_15px_rgba(99,102,241,0.3)] cursor-pointer shrink-0"
                    >
                      {insurerSendingOtp ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>{insurerTimer > 0 ? b(`Resend (${insurerTimer}s)`, `ಮರುಕಳುಹಿಸಿ (${insurerTimer}ಸೆ)`, language) : b('Send OTP', 'OTP ಕಳುಹಿಸಿ', language)}</span>
                    </button>
                  </div>
                </div>

                {/* OTP Input Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="insurer-otp" className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{b('Officer Authorization OTP', 'ಅಧಿಕಾರಿ ದೃಢೀಕರಣ OTP', language)}</span>
                    </label>
                    {insurerDemoOtp && (
                      <span className="text-[11px] font-mono text-indigo-300 font-bold bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-500/40">
                        ⚡ {b('Demo OTP:', 'ಡೆಮೊ OTP:', language)} {insurerDemoOtp}
                      </span>
                    )}
                  </div>
                  <input
                    id="insurer-otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    required
                    value={insurerOtp}
                    onChange={(e) => {
                      setInsurerOtp(e.target.value.replace(/\D/g, ''));
                      setInsurerError(null);
                    }}
                    placeholder={b('Enter 4 or 6 digit officer OTP', '೪ ಅಥವಾ ೬ ಅಂಕಿಯ ಅಧಿಕಾರಿ OTP ನಮೂದಿಸಿ', language)}
                    className="w-full bg-slate-950/80 border border-slate-700 focus:bg-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-4 py-2.5 sm:py-3 text-white text-base font-mono tracking-widest text-center placeholder:text-sm placeholder:text-slate-500 placeholder:tracking-normal transition outline-none"
                  />
                </div>

                {/* Quick Demo Fill Pill */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setCompanyId('AGRI-INS-409');
                      setInsurerMobile('9812345678');
                      setInsurerError(null);
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium underline flex items-center gap-1 cursor-pointer font-mono"
                  >
                    <span>{b('⚡ Quick-fill: AGRI-INS-409 (Ananya Sharma - AIC PMFBY)', '⚡ ತ್ವರಿತ-ಭರ್ತಿ: AGRI-INS-409 (ಅನನ್ಯಾ ಶರ್ಮಾ - AIC PMFBY)', language)}</span>
                  </button>
                </div>

                {/* Error Banner */}
                {insurerError && (
                  <div className="p-3 bg-rose-950/50 border border-rose-800/60 rounded-xl text-rose-300 text-xs flex items-center gap-2 animate-shake">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{insurerError}</span>
                  </div>
                )}

                {/* Success Banner */}
                {insurerSuccessMsg && (
                  <div className="p-3 bg-indigo-950/50 border border-indigo-500/40 rounded-xl text-indigo-300 text-xs flex items-center gap-2 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-indigo-400" />
                    <span>{insurerSuccessMsg}</span>
                  </div>
                )}
              </div>

              {/* Verify OTP Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={insurerVerifyingOtp || !insurerOtp}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(99,102,241,0.35)] flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  {insurerVerifyingOtp ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{b('Verifying Insurer Credentials...', 'ವಿಮಾಧಿಕಾರಿ ರುಜುವಾತುಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...', language)}</span>
                    </>
                  ) : (
                    <>
                      <span>{b('Verify OTP & Enter Reviewer Console', 'OTP ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಪರಿಶೀಲನಾ ಕನ್ಸೋಲ್‌ಗೆ ಪ್ರವೇಶಿಸಿ', language)}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-[11px] text-slate-400 text-center mt-2.5">
                  {b('Accesses satellite verification swarm, AI agents & claim approval', 'ಉಪಗ್ರಹ ಪರಿಶೀಲನಾ ಸ್ವಾರ್ಮ್, AI ಏಜೆಂಟ್‌ಗಳು ಮತ್ತು ಕ್ಲೈಮ್ ಅನುಮೋದನೆಯ ಪ್ರವೇಶ', language)}
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* ============================================================== */}
      {/* 3. FOOTER                                                      */}
      {/* ============================================================== */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-[#0A0F1D]/80 backdrop-blur-xl py-4 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white">KisanClaim</span>
            <span className="text-slate-600">•</span>
            <span>{b('Government of India PMFBY Adjudication Standard', 'ಭಾರತ ಸರ್ಕಾರ PMFBY ತೀರ್ಪು ಮಾನದಂಡ', language)}</span>
          </div>
          <div className="font-mono text-[11px] text-slate-500">
            {b('Powered by Copernicus Sentinel-2 MSI • Open-Meteo • DoLR ULPIN Bhu-Aadhaar', 'ಕೋಪರ್ನಿಕಸ್ ಸೆಂಟಿನೆಲ್-2 MSI • ಓಪನ್-ಮೀಟಿಯೋ • DoLR ULPIN ಭೂ-ಆಧಾರ್ ನಿಂದ ನಿಯಂತ್ರಿಸಲ್ಪಡುತ್ತದೆ', language)}
          </div>
        </div>
      </footer>
    </div>
  );
};
