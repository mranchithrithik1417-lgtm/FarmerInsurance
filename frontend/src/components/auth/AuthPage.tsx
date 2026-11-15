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
  Lock,
  RefreshCw,
  Send,
  UserCheck,
  Globe,
  Check,
  Sprout
} from 'lucide-react';
import { UserSession } from '../../types';
import {
  sendFarmerOTP,
  verifyFarmerOTP,
  sendInsurerOTP,
  verifyInsurerOTP
} from '../../services/api';

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
        // Pre-fill for reviewer test convenience
        setFarmerOtp(res.demo_otp);
      }
      setFarmerTimer(60);
    } catch (err: any) {
      setFarmerError(err.message || 'Failed to send OTP. Please check your network.');
    } finally {
      setFarmerSendingOtp(false);
    }
  };

  const handleFarmerVerifyOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFarmerError(null);

    const cleanMob = farmerMobile.trim().replace(/\D/g, '');
    const cleanOtp = farmerOtp.trim();

    if (cleanMob.length !== 10) {
      setFarmerError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (!cleanOtp || cleanOtp.length < 4) {
      setFarmerError('Please enter the 4-digit verification OTP received on your mobile.');
      return;
    }

    setFarmerVerifyingOtp(true);
    try {
      const session = await verifyFarmerOTP(cleanMob, cleanOtp);
      setFarmerSuccessMsg('Verification successful! Entering Farmer ULPIN Dashboard...');
      setTimeout(() => {
        onLoginSuccess(session);
      }, 400);
    } catch (err: any) {
      setFarmerError(err.message || 'Invalid OTP entered. Please check and try again.');
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

    if (!cid || cid.length < 3) {
      setInsurerError('Please enter your authorized Insurance Company ID (e.g. AGRI-INS-409).');
      return;
    }
    if (cleanMob.length !== 10) {
      setInsurerError('Please enter the officer registered 10-digit mobile number.');
      return;
    }

    setInsurerSendingOtp(true);
    try {
      const res = await sendInsurerOTP(cid, cleanMob);
      setInsurerOtpSent(true);
      setInsurerSuccessMsg(res.message || `Authorization OTP sent to +91 XXXXXX${cleanMob.slice(-4)}`);
      if (res.demo_otp) {
        setInsurerDemoOtp(res.demo_otp);
        setInsurerOtp(res.demo_otp);
      }
      setInsurerTimer(60);
    } catch (err: any) {
      setInsurerError(err.message || 'Failed to send officer OTP. Verify your Company ID.');
    } finally {
      setInsurerSendingOtp(false);
    }
  };

  const handleInsurerVerifyOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setInsurerError(null);

    const cid = companyId.trim().toUpperCase();
    const cleanMob = insurerMobile.trim().replace(/\D/g, '');
    const cleanOtp = insurerOtp.trim();

    if (!cid || cid.length < 3) {
      setInsurerError('Company ID is required.');
      return;
    }
    if (cleanMob.length !== 10) {
      setInsurerError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!cleanOtp || cleanOtp.length < 4) {
      setInsurerError('Please enter the 4-digit officer authorization OTP.');
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
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-[#F8FAF9] to-emerald-50/30 flex flex-col justify-between selection:bg-emerald-600 selection:text-white relative overflow-hidden">
      {/* Subtle organic background glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* ============================================================== */}
      {/* 1. TOP PROMINENT HEADER WITH OFFICIAL KISANCLAIM LOGO           */}
      {/* ============================================================== */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          {/* Official Logo Symbol */}
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 text-white shadow-md shadow-emerald-700/20 text-2xl font-bold">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-slate-900">
                Kisan<span className="text-emerald-700">Claim</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-mono">
                PMFBY AI TELEMETRY
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              National Crop Damage Evidence Intelligence & Claim Verification Platform
            </p>
          </div>
        </div>

        {/* Language Selector Toggle */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-xs">
          <Globe className="w-4 h-4 text-emerald-700 ml-1.5" />
          <button
            type="button"
            onClick={() => onLanguageChange('en')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
              language === 'en'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange('kn')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
              language === 'kn'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
            <span>Secure Role-Based Agricultural Insurance Access</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Sign In to KisanClaim
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Select your portal below. Farmers authenticate via Mobile OTP to access the ULPIN Cadastral Dashboard.
            Insurers authenticate via Company ID & Officer OTP to access the Claim Adjudication Console.
          </p>
        </div>

        {/* TWO SEPARATED CARDS ON THE SAME PAGE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* ============================================================ */}
          {/* CARD 1: FARMER LOGIN                                         */}
          {/* ============================================================ */}
          <div className="relative rounded-3xl bg-white border border-emerald-200/90 p-6 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300">
            {/* Card Header Badge */}
            <div className="flex items-center justify-between pb-4 border-b border-emerald-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-200">
                  <span className="text-2xl">🌾</span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Farmer Login</h3>
                  <p className="text-xs text-emerald-700 font-mono font-medium">Bhu-Aadhaar & ULPIN Portal</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-200">
                ROLE: FARMER
              </span>
            </div>

            {/* Farmer Form */}
            <form onSubmit={handleFarmerVerifyOTP} className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Mobile Number Input Field */}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Mobile Number</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 font-mono font-bold">10 DIGITS</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-mono text-sm font-semibold">
                        +91
                      </div>
                      <input
                        type="tel"
                        maxLength={10}
                        required
                        value={farmerMobile}
                        onChange={(e) => {
                          setFarmerMobile(e.target.value.replace(/\D/g, ''));
                          setFarmerError(null);
                        }}
                        placeholder="9876543210"
                        className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-emerald-600 rounded-2xl pl-12 pr-4 py-3 text-slate-900 text-sm font-mono tracking-wider focus:outline-none focus:ring-4 focus:ring-emerald-500/15 transition shadow-xs"
                      />
                    </div>

                    {/* Send OTP Button */}
                    <button
                      type="button"
                      disabled={farmerSendingOtp || farmerMobile.trim().length !== 10 || farmerTimer > 0}
                      onClick={handleFarmerSendOTP}
                      className="px-4 py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-2xl flex items-center gap-1.5 transition shadow-xs cursor-pointer shrink-0"
                    >
                      {farmerSendingOtp ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>{farmerTimer > 0 ? `Resend (${farmerTimer}s)` : 'Send OTP'}</span>
                    </button>
                  </div>
                </div>

                {/* OTP Input Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Enter OTP Code</span>
                    </label>
                    {farmerDemoOtp && (
                      <span className="text-[11px] font-mono text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                        ⚡ Demo OTP: {farmerDemoOtp}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={farmerOtp}
                    onChange={(e) => {
                      setFarmerOtp(e.target.value.replace(/\D/g, ''));
                      setFarmerError(null);
                    }}
                    placeholder="Enter 4-digit OTP"
                    className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-emerald-600 rounded-2xl px-4 py-3 text-slate-900 text-sm font-mono tracking-widest text-center text-lg placeholder:text-sm placeholder:tracking-normal focus:outline-none focus:ring-4 focus:ring-emerald-500/15 transition shadow-xs"
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
                    className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>⚡ Quick-fill: 9876543210 (Ravi Kumar - Karnataka)</span>
                  </button>
                </div>

                {/* Error Banner */}
                {farmerError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-center gap-2 animate-shake">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{farmerError}</span>
                  </div>
                )}

                {/* Success Banner */}
                {farmerSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center gap-2 animate-fadeIn font-medium">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
                    <span>{farmerSuccessMsg}</span>
                  </div>
                )}
              </div>

              {/* Verify OTP Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={farmerVerifyingOtp || !farmerOtp}
                  className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm tracking-wide shadow-sm flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  {farmerVerifyingOtp ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying Farmer OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify OTP & Open Farmer ULPIN Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-[11px] text-slate-500 text-center mt-2.5">
                  Redirects to land parcel identification & ULPIN linking
                </p>
              </div>
            </form>
          </div>

          {/* ============================================================ */}
          {/* CARD 2: INSURER LOGIN                                        */}
          {/* ============================================================ */}
          <div className="relative rounded-3xl bg-white border border-blue-200/90 p-6 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300">
            {/* Card Header Badge */}
            <div className="flex items-center justify-between pb-4 border-b border-blue-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 text-blue-700 rounded-2xl border border-blue-200">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Insurer Login</h3>
                  <p className="text-xs text-blue-700 font-mono font-medium">PMFBY Adjudication Console</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold uppercase tracking-wider border border-blue-200">
                ROLE: INSURER
              </span>
            </div>

            {/* Insurer Form */}
            <form onSubmit={handleInsurerVerifyOTP} className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Company ID Input Field */}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                      <span>Company ID</span>
                    </span>
                    <span className="text-[10px] text-blue-700 font-mono font-bold">OFFICIAL ID</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={companyId}
                    onChange={(e) => {
                      setCompanyId(e.target.value.toUpperCase());
                      setInsurerError(null);
                    }}
                    placeholder="e.g. AGRI-INS-409"
                    className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-600 rounded-2xl px-4 py-3 text-slate-900 text-sm font-mono tracking-wider focus:outline-none focus:ring-4 focus:ring-blue-500/15 transition shadow-xs"
                  />
                </div>

                {/* Mobile Number Input Field */}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-blue-700" />
                      <span>Officer Mobile Number</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">10 DIGITS</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-mono text-sm font-semibold">
                        +91
                      </div>
                      <input
                        type="tel"
                        maxLength={10}
                        required
                        value={insurerMobile}
                        onChange={(e) => {
                          setInsurerMobile(e.target.value.replace(/\D/g, ''));
                          setInsurerError(null);
                        }}
                        placeholder="9812345678"
                        className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-600 rounded-2xl pl-12 pr-4 py-3 text-slate-900 text-sm font-mono tracking-wider focus:outline-none focus:ring-4 focus:ring-blue-500/15 transition shadow-xs"
                      />
                    </div>

                    {/* Send OTP Button */}
                    <button
                      type="button"
                      disabled={insurerSendingOtp || insurerMobile.trim().length !== 10 || insurerTimer > 0}
                      onClick={handleInsurerSendOTP}
                      className="px-4 py-3 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-2xl flex items-center gap-1.5 transition shadow-xs cursor-pointer shrink-0"
                    >
                      {insurerSendingOtp ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>{insurerTimer > 0 ? `Resend (${insurerTimer}s)` : 'Send OTP'}</span>
                    </button>
                  </div>
                </div>

                {/* OTP Input Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-blue-700" />
                      <span>Officer Authorization OTP</span>
                    </label>
                    {insurerDemoOtp && (
                      <span className="text-[11px] font-mono text-blue-800 font-bold bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                        ⚡ Demo OTP: {insurerDemoOtp}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={insurerOtp}
                    onChange={(e) => {
                      setInsurerOtp(e.target.value.replace(/\D/g, ''));
                      setInsurerError(null);
                    }}
                    placeholder="Enter 4-digit officer OTP"
                    className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-600 rounded-2xl px-4 py-3 text-slate-900 text-sm font-mono tracking-widest text-center text-lg placeholder:text-sm placeholder:tracking-normal focus:outline-none focus:ring-4 focus:ring-blue-500/15 transition shadow-xs"
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
                    className="text-[11px] text-blue-700 hover:text-blue-800 font-semibold underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>⚡ Quick-fill: AGRI-INS-409 (Ananya Sharma - AIC PMFBY)</span>
                  </button>
                </div>

                {/* Error Banner */}
                {insurerError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-center gap-2 animate-shake">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{insurerError}</span>
                  </div>
                )}

                {/* Success Banner */}
                {insurerSuccessMsg && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-blue-800 text-xs flex items-center gap-2 animate-fadeIn font-medium">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-700" />
                    <span>{insurerSuccessMsg}</span>
                  </div>
                )}
              </div>

              {/* Verify OTP Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={insurerVerifyingOtp || !insurerOtp}
                  className="w-full py-3.5 rounded-2xl bg-blue-700 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm tracking-wide shadow-sm flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  {insurerVerifyingOtp ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying Insurer Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify OTP & Enter Reviewer Console</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-[11px] text-slate-500 text-center mt-2.5">
                  Accesses satellite verification swarm, AI agents & claim approval
                </p>
              </div>
            </form>
          </div>

        </div>
      </main>

      {/* ============================================================== */}
      {/* 3. FOOTER                                                      */}
      {/* ============================================================== */}
      <footer className="relative z-10 border-t border-slate-200/90 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-emerald-800">KisanClaim</span>
            <span className="text-slate-300">•</span>
            <span>Government of India PMFBY Adjudication Standard</span>
          </div>
          <div className="font-mono text-[11px] text-slate-500">
            Powered by Copernicus Sentinel-2 MSI • Open-Meteo • DoLR ULPIN Bhu-Aadhaar
          </div>
        </div>
      </footer>
    </div>
  );
};
