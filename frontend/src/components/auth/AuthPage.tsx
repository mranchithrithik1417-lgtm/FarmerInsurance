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
  Check
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
    <div className="min-h-screen bg-black text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-black relative overflow-hidden font-sans">
      {/* Background Futuristic Neon Grid and Ambient Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:32px_32px] opacity-15 pointer-events-none" />
      <div className="absolute -top-40 left-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute -bottom-40 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px] pointer-events-none" />

      {/* ============================================================== */}
      {/* 1. TOP PROMINENT HEADER WITH OFFICIAL KISANCLAIM LOGO           */}
      {/* ============================================================== */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          {/* Official Logo Symbol */}
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-green-400 to-teal-300 text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.5)] text-2xl font-black">
            🌾
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-white">
                Kisan<span className="text-emerald-400">Claim</span>
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono">
                AI TELEMETRY
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              National Crop Damage Evidence Intelligence & Claim Verification Platform
            </p>
          </div>
        </div>

        {/* Language Selector Toggle */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-1.5 shadow-lg">
          <Globe className="w-4 h-4 text-emerald-400 ml-1.5" />
          <button
            type="button"
            onClick={() => onLanguageChange('en')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
              language === 'en'
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/25'
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
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/25'
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Secure Role-Based Agricultural Insurance Access</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            Sign In to KisanClaim
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Select your portal below. Farmers authenticate via Mobile OTP to access the ULPIN Cadastral Dashboard.
            Insurers authenticate via Company ID & Officer OTP to access the Claim Adjudication Console.
          </p>
        </div>

        {/* TWO SEPARATED CARDS ON THE SAME PAGE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* ============================================================ */}
          {/* CARD 1: FARMER LOGIN                                         */}
          {/* ============================================================ */}
          <div className="relative rounded-3xl bg-slate-900/90 border-2 border-emerald-500/50 p-6 sm:p-8 flex flex-col justify-between shadow-[0_0_40px_rgba(16,185,129,0.15)] hover:border-emerald-400 transition-all duration-300">
            {/* Card Header Badge */}
            <div className="flex items-center justify-between pb-4 border-b border-emerald-500/20 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
                  <span className="text-2xl">🌾</span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Farmer Login</h3>
                  <p className="text-xs text-emerald-400 font-mono">Bhu-Aadhaar & ULPIN Portal</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-500/40">
                ROLE: FARMER
              </span>
            </div>

            {/* Farmer Form */}
            <form onSubmit={handleFarmerVerifyOTP} className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Mobile Number Input Field */}
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Mobile Number</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">10 DIGITS</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-mono text-sm">
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
                        className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-400 rounded-2xl pl-12 pr-4 py-3 text-white text-sm font-mono tracking-wider focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition"
                      />
                    </div>

                    {/* Send OTP Button */}
                    <button
                      type="button"
                      disabled={farmerSendingOtp || farmerMobile.trim().length !== 10 || farmerTimer > 0}
                      onClick={handleFarmerSendOTP}
                      className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-xs rounded-2xl flex items-center gap-1.5 transition shadow-md shadow-emerald-600/30 cursor-pointer shrink-0"
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
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Enter OTP Code</span>
                    </label>
                    {farmerDemoOtp && (
                      <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
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
                    className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-400 rounded-2xl px-4 py-3 text-white text-sm font-mono tracking-widest text-center text-lg placeholder:text-sm placeholder:tracking-normal focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition"
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
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-mono underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>⚡ Quick-fill: 9876543210 (Ravi Kumar - Karnataka)</span>
                  </button>
                </div>

                {/* Error Banner */}
                {farmerError && (
                  <div className="p-3 bg-rose-950/70 border border-rose-500/50 rounded-2xl text-rose-300 text-xs flex items-center gap-2 animate-shake">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{farmerError}</span>
                  </div>
                )}

                {/* Success Banner */}
                {farmerSuccessMsg && (
                  <div className="p-3 bg-emerald-950/70 border border-emerald-500/50 rounded-2xl text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{farmerSuccessMsg}</span>
                  </div>
                )}
              </div>

              {/* Verify OTP Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={farmerVerifyingOtp || !farmerOtp}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 transition cursor-pointer"
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
          <div className="relative rounded-3xl bg-slate-900/90 border-2 border-cyan-500/40 p-6 sm:p-8 flex flex-col justify-between shadow-[0_0_40px_rgba(6,182,212,0.12)] hover:border-cyan-400 transition-all duration-300">
            {/* Card Header Badge */}
            <div className="flex items-center justify-between pb-4 border-b border-cyan-500/20 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-2xl border border-cyan-500/30">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Insurer Login</h3>
                  <p className="text-xs text-cyan-400 font-mono">PMFBY Adjudication Console</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-extrabold uppercase tracking-wider border border-cyan-500/40">
                ROLE: INSURER
              </span>
            </div>

            {/* Insurer Form */}
            <form onSubmit={handleInsurerVerifyOTP} className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Company ID Input Field */}
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Company ID</span>
                    </span>
                    <span className="text-[10px] text-cyan-400 font-mono font-bold">OFFICIAL ID</span>
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
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-2xl px-4 py-3 text-white text-sm font-mono tracking-wider focus:outline-none focus:ring-4 focus:ring-cyan-500/20 transition"
                  />
                </div>

                {/* Mobile Number Input Field */}
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Officer Mobile Number</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">10 DIGITS</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-mono text-sm">
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
                        className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-2xl pl-12 pr-4 py-3 text-white text-sm font-mono tracking-wider focus:outline-none focus:ring-4 focus:ring-cyan-500/20 transition"
                      />
                    </div>

                    {/* Send OTP Button */}
                    <button
                      type="button"
                      disabled={insurerSendingOtp || insurerMobile.trim().length !== 10 || insurerTimer > 0}
                      onClick={handleInsurerSendOTP}
                      className="px-4 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-xs rounded-2xl flex items-center gap-1.5 transition shadow-md shadow-cyan-600/30 cursor-pointer shrink-0"
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
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Officer Authorization OTP</span>
                    </label>
                    {insurerDemoOtp && (
                      <span className="text-[11px] font-mono text-cyan-400 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
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
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-2xl px-4 py-3 text-white text-sm font-mono tracking-widest text-center text-lg placeholder:text-sm placeholder:tracking-normal focus:outline-none focus:ring-4 focus:ring-cyan-500/20 transition"
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
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>⚡ Quick-fill: AGRI-INS-409 (Ananya Sharma - AIC PMFBY)</span>
                  </button>
                </div>

                {/* Error Banner */}
                {insurerError && (
                  <div className="p-3 bg-rose-950/70 border border-rose-500/50 rounded-2xl text-rose-300 text-xs flex items-center gap-2 animate-shake">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{insurerError}</span>
                  </div>
                )}

                {/* Success Banner */}
                {insurerSuccessMsg && (
                  <div className="p-3 bg-cyan-950/70 border border-cyan-500/50 rounded-2xl text-cyan-300 text-xs flex items-center gap-2 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-cyan-400" />
                    <span>{insurerSuccessMsg}</span>
                  </div>
                )}
              </div>

              {/* Verify OTP Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={insurerVerifyingOtp || !insurerOtp}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-cyan-500/30 flex items-center justify-center gap-2 transition cursor-pointer"
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
      <footer className="relative z-10 border-t border-slate-900 py-4 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">KisanClaim</span>
            <span>•</span>
            <span>Government of India PMFBY Adjudication Standard</span>
          </div>
          <div className="font-mono text-[11px] text-slate-600">
            Powered by Copernicus Sentinel-2 MSI • Open-Meteo • DoLR ULPIN Bhu-Aadhaar
          </div>
        </div>
      </footer>
    </div>
  );
};
