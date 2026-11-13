import React, { useState } from 'react';
import {
  Compass,
  ArrowRight,
  Search,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  FileText,
  Clock,
  HelpCircle,
  Check,
  RefreshCw
} from 'lucide-react';
import { OfficialLandRecord } from '../../types';
import { validateULPIN } from '../../services/api';

interface Props {
  currentUser?: any;
  language: 'en' | 'kn';
  onProceedToAssessment: (land: OfficialLandRecord) => void;
  onNavigateToForgotULPIN: () => void;
  onViewPreviousClaims?: () => void;
  hasExistingClaims?: boolean;
}

export const FarmerULPINDashboard: React.FC<Props> = ({
  currentUser,
  language,
  onProceedToAssessment,
  onNavigateToForgotULPIN,
  onViewPreviousClaims,
  hasExistingClaims = false
}) => {
  const [ulpinInput, setUlpinInput] = useState<string>('');
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [verifiedLand, setVerifiedLand] = useState<OfficialLandRecord | null>(null);

  const farmerName = currentUser?.name || 'Ravi Kumar';

  // Format validation: 14 uppercase alphanumeric chars
  const cleanInput = ulpinInput.trim().replace(/[^0-9a-zA-Z]/g, '').toUpperCase();
  const isFormatValid = cleanInput.length === 14;

  const handleValidate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setVerifiedLand(null);

    if (!cleanInput) {
      setErrorMsg('Please enter your 14-character ULPIN (Unique Land Parcel Identification Number).');
      return;
    }

    if (cleanInput.length !== 14) {
      setErrorMsg(`ULPIN must be exactly 14 characters. Currently entered: ${cleanInput.length} characters.`);
      return;
    }

    setIsValidating(true);
    try {
      const res = await validateULPIN(cleanInput);
      if (res.valid && res.land) {
        setVerifiedLand(res.land);
      } else {
        setErrorMsg(res.message || 'No cadastral land record found for this ULPIN.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error validating ULPIN. Please check your internet connection.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleUseDemo = (demoCode: string) => {
    setUlpinInput(demoCode);
    setErrorMsg(null);
    setVerifiedLand(null);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* ============================================================== */}
      {/* 1. TOP WELCOME & CADASTRAL IDENTIFICATION HERO BANNER         */}
      {/* ============================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-emerald-950/80 to-slate-900 border border-emerald-500/40 p-6 md:p-8 shadow-[0_0_50px_rgba(16,185,129,0.15)]">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>National Bhu-Aadhaar • ULPIN Land Registry Integration</span>
            </div>

            {/* Official KisanClaim Brand Logo + Welcome */}
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-400 text-white shadow-lg shadow-emerald-500/30 text-2xl font-black">
                🌾
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Welcome to KisanClaim, {farmerName}!
                </h1>
                <p className="text-xs text-emerald-400/90 font-mono">
                  PMFBY AI Crop Loss Telemetry & Land Co-Registration
                </p>
              </div>
            </div>

            {/* Main Prompt Heading */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-teal-300 tracking-tight mt-3">
              Identify Your Agricultural Land
            </h2>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Every agricultural land parcel in India is assigned a 14-digit geospatial 
              <strong> Unique Land Parcel Identification Number (ULPIN / Bhu-Aadhaar)</strong>. 
              Connecting your ULPIN auto-links cadastral boundaries, DIGIPIN coordinates, and 
              Sentinel-2 satellite evidence for crop loss compensation.
            </p>
          </div>

          {/* Quick Stats or Previous Claims Button */}
          {hasExistingClaims && onViewPreviousClaims && (
            <div className="flex flex-col gap-2 shrink-0">
              <button
                type="button"
                onClick={onViewPreviousClaims}
                className="px-5 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-emerald-400 border border-emerald-500/40 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-emerald-500/10 cursor-pointer"
              >
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>View My Existing Claim Dossiers</span>
              </button>
              <div className="text-[11px] text-slate-400 text-center font-mono">
                Historical satellite evidence active
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. TWO PROMINENT OPTIONS IN SEPARATE CARDS                     */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* OPTION 1: I KNOW MY ULPIN CARD */}
        <div className="relative rounded-3xl bg-slate-900/90 border-2 border-emerald-500/50 p-6 md:p-8 flex flex-col justify-between shadow-2xl hover:border-emerald-400 transition-all duration-300 group">
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-extrabold uppercase tracking-wider border border-emerald-500/40">
              <Sparkles className="w-3.5 h-3.5" /> Option 1
            </span>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white group-hover:text-emerald-300 transition-colors">
                  I Know My ULPIN
                </h3>
                <span className="text-xs text-slate-400 font-mono">Direct Cadastral Input</span>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Enter your land's ULPIN to continue with crop damage assessment.
              We will instantly verify it against the National Cadastral Registry.
            </p>

            {/* Input Form */}
            <form onSubmit={handleValidate} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>14-Character ULPIN (Bhu-Aadhaar)</span>
                    <span className="text-emerald-400">*</span>
                  </label>
                  <span className={`text-[11px] font-mono ${isFormatValid ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                    {cleanInput.length}/14 Characters
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    maxLength={14}
                    value={ulpinInput}
                    onChange={(e) => {
                      setUlpinInput(e.target.value.toUpperCase());
                      setErrorMsg(null);
                      setVerifiedLand(null);
                    }}
                    placeholder="e.g. 29BLR125200102"
                    className="w-full bg-slate-950 border-2 border-slate-700 focus:border-emerald-400 rounded-2xl px-4 py-3.5 text-white font-mono text-base tracking-widest placeholder:text-slate-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition"
                  />
                  {isFormatValid && (
                    <div className="absolute right-3.5 top-3.5 p-1 bg-emerald-500/20 text-emerald-400 rounded-lg">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>

              {/* Demo Pre-fill Chips for quick testing */}
              <div className="pt-1">
                <div className="text-[11px] text-slate-400 mb-1.5 font-semibold">
                  ⚡ Quick Demo Parcels:
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleUseDemo('29BLR125200102')}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-mono rounded-lg border border-emerald-500/30 transition cursor-pointer"
                  >
                    29BLR125200102 (Ravi - Survey 125/2)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUseDemo('29BEL048100108')}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-mono rounded-lg border border-emerald-500/30 transition cursor-pointer"
                  >
                    29BEL048100108 (Suresh - 48/1A)
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3.5 bg-rose-950/60 border border-rose-500/50 rounded-2xl text-rose-300 text-xs flex items-start gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Continue / Validate Button */}
              {!verifiedLand && (
                <button
                  type="submit"
                  disabled={isValidating || !cleanInput}
                  className="w-full mt-4 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-sm tracking-wide shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  {isValidating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying Land Registry...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </form>
          </div>

          {/* ============================================================== */}
          {/* CONFIRMATION CARD (Displays if ULPIN is valid)                 */}
          {/* ============================================================== */}
          {verifiedLand && (
            <div className="mt-6 pt-5 border-t border-emerald-500/30 animate-fadeIn">
              <div className="bg-emerald-950/70 border border-emerald-500/50 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-500/30 mb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Land Details Confirmed
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-emerald-500 text-slate-950">
                    VERIFIED
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Land Owner</span>
                    <strong className="text-white text-sm">{verifiedLand.farmer_name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Survey Number</span>
                    <strong className="text-emerald-300 font-mono text-sm">#{verifiedLand.survey_number}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Location</span>
                    <span className="text-slate-200">{verifiedLand.village}, {verifiedLand.taluk}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">District & State</span>
                    <span className="text-slate-200">{verifiedLand.district}, {verifiedLand.state}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Area</span>
                    <strong className="text-white">{verifiedLand.area_acres} Acres</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">DIGIPIN Code</span>
                    <strong className="text-cyan-300 font-mono">{verifiedLand.digipin}</strong>
                  </div>
                </div>

                {/* Cadastral & GPS Badge */}
                <div className="mt-3 pt-2.5 border-t border-emerald-500/20 flex items-center justify-between text-[11px] text-emerald-300/90 font-mono">
                  <span>📍 GPS: {verifiedLand.latitude.toFixed(4)}°N, {verifiedLand.longitude.toFixed(4)}°E</span>
                  <span>🛰️ Sentinel-2 Active</span>
                </div>

                {/* Proceed Button */}
                <button
                  type="button"
                  onClick={() => onProceedToAssessment(verifiedLand)}
                  className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-400 hover:to-green-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 transition cursor-pointer"
                >
                  <span>Confirm & Continue to Crop Assessment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* OPTION 2: FORGOT MY ULPIN CARD */}
        <div className="relative rounded-3xl bg-slate-900/90 border border-slate-800 p-6 md:p-8 flex flex-col justify-between shadow-2xl hover:border-cyan-500/50 transition-all duration-300 group">
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-[11px] font-extrabold uppercase tracking-wider border border-cyan-500/40">
              <Search className="w-3.5 h-3.5" /> Option 2
            </span>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-cyan-500/20 rounded-2xl text-cyan-400 border border-cyan-500/30">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white group-hover:text-cyan-300 transition-colors">
                  Forgot My ULPIN
                </h3>
                <span className="text-xs text-slate-400 font-mono">Cadastral Recovery</span>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Don't know your ULPIN? Retrieve it using your land details.
              Search by your name, district, taluk, village, and survey number.
            </p>

            {/* Feature highlights */}
            <div className="space-y-3 mb-8 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                  ✓
                </div>
                <span>Instant retrieval from State Land & Bhoomi records</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                  ✓
                </div>
                <span>No physical document upload or land passbook needed</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                  ✓
                </div>
                <span>Auto-populates coordinates directly into crop assessment</span>
              </div>
            </div>
          </div>

          {/* Retrieve ULPIN Action Button */}
          <div>
            <button
              type="button"
              onClick={onNavigateToForgotULPIN}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Retrieve ULPIN</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
            <p className="text-[11px] text-slate-500 text-center mt-3">
              Takes less than 15 seconds to look up your agricultural parcel
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
