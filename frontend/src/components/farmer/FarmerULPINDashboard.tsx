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
  ShieldCheck,
  Check,
  RefreshCw
} from 'lucide-react';
import { OfficialLandRecord } from '../../types';
import { validateULPIN } from '../../services/api';
import { t, b } from '../../utils/translations';

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
      setErrorMsg(
        language === 'kn'
          ? 'ದಯವಿಟ್ಟು ನಿಮ್ಮ 14-ಅಕ್ಷರಗಳ ULPIN (ಭೂ-ಆಧಾರ್) ನಮೂದಿಸಿ (Please enter your 14-character ULPIN).'
          : 'Please enter your 14-character ULPIN (Unique Land Parcel Identification Number).'
      );
      return;
    }

    if (cleanInput.length !== 14) {
      setErrorMsg(
        language === 'kn'
          ? `ULPIN ಕರಾರುವಾಕ್ಕಾಗಿ 14 ಅಕ್ಷರಗಳಾಗಿರಬೇಕು. ಪ್ರಸ್ತುತ ನಮೂದಿಸಿರುವುದು: ${cleanInput.length} ಅಕ್ಷರಗಳು.`
          : `ULPIN must be exactly 14 characters. Currently entered: ${cleanInput.length} characters.`
      );
      return;
    }

    setIsValidating(true);
    try {
      const res = await validateULPIN(cleanInput);
      if (res.valid && res.land) {
        setVerifiedLand(res.land);
      } else {
        setErrorMsg(res.message || (language === 'kn' ? 'ಈ ULPIN ಗೆ ಯಾವುದೇ ಭೂಮಿ ದಾಖಲೆ ಕಂಡುಬಂದಿಲ್ಲ.' : 'No cadastral land record found for this ULPIN.'));
      }
    } catch (err: any) {
      setErrorMsg(err.message || (language === 'kn' ? 'ULPIN ಪರಿಶೀಲಿಸುವಲ್ಲಿ ದೋಷ ಕಂಡುಬಂದಿದೆ.' : 'Error validating ULPIN. Please check your internet connection.'));
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-50 via-white to-green-50/60 border border-emerald-200 p-6 md:p-8 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
              <span>
                {language === 'kn'
                  ? 'ರಾಷ್ಟ್ರೀಯ ಭೂ-ಆಧಾರ್ • ULPIN ಜಮೀನು ನೋಂದಣಿ ಏಕೀಕರಣ (National Bhu-Aadhaar)'
                  : 'National Bhu-Aadhaar • ULPIN Land Registry Integration'}
              </span>
            </div>

            {/* Official KisanClaim Brand Logo + Welcome */}
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-800 to-green-600 text-white shadow-xs text-2xl font-black">
                🌾
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {language === 'kn'
                    ? `ಕಿಸಾನ್‌ಕ್ಲೇಮ್‌ಗೆ ಸ್ವಾಗತ, ${farmerName}! (Welcome, ${farmerName}!)`
                    : `Welcome to KisanClaim, ${farmerName}!`}
                </h1>
                <p className="text-xs text-emerald-700 font-medium">
                  {language === 'kn'
                    ? 'ಪಿಎಂಎಫ್‌ಬಿವೈ ಎಐ ಬೆಳೆ ಹಾನಿ ಪುರಾವೆ ಮತ್ತು ಜಮೀನು ನೋಂದಣಿ ವೇದಿಕೆ'
                    : 'PMFBY AI Crop Loss Telemetry & Land Co-Registration'}
                </p>
              </div>
            </div>

            {/* Main Prompt Heading */}
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              {language === 'kn'
                ? 'ನಿಮ್ಮ ಕೃಷಿ ಭೂಮಿಯನ್ನು ಗುರುತಿಸಿ / Identify Your Agricultural Land'
                : 'Identify Your Agricultural Land / ನಿಮ್ಮ ಕೃಷಿ ಭೂಮಿಯನ್ನು ಗುರುತಿಸಿ'}
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              {language === 'kn' ? (
                <>
                  ಭಾರತದಲ್ಲಿನ ಪ್ರತಿಯೊಂದು ಕೃಷಿ ಭೂಮಿಗೆ 14-ಅಂಕಿಯ{' '}
                  <strong className="text-slate-800 font-semibold">ವಿಶಿಷ್ಟ ಭೂಮಿ ಪಾರ್ಸೆಲ್ ಗುರುತಿನ ಸಂಖ್ಯೆ (ULPIN / ಭೂ-ಆಧಾರ್)</strong> ನೀಡಲಾಗಿದೆ.
                  ನಿಮ್ಮ ULPIN ಸಂಪರ್ಕಿಸುವುದರಿಂದ ಗಡಿಗಳು, ಡಿಜಿಪಿನ್ ನಿರ್ದೇಶಾಂಕಗಳು ಮತ್ತು ಸೆಂಟಿನೆಲ್-2 ಉಪಗ್ರಹ ಸಾಕ್ಷ್ಯಗಳು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಜೋಡಣೆಯಾಗುತ್ತವೆ.
                </>
              ) : (
                <>
                  Every agricultural land parcel in India is assigned a 14-digit geospatial{' '}
                  <strong className="text-slate-800 font-semibold">Unique Land Parcel Identification Number (ULPIN / Bhu-Aadhaar)</strong>. 
                  Connecting your ULPIN auto-links cadastral boundaries, DIGIPIN coordinates, and 
                  Sentinel-2 satellite evidence for crop loss compensation.
                </>
              )}
            </p>
          </div>

          {/* Quick Stats or Previous Claims Button */}
          {hasExistingClaims && onViewPreviousClaims && (
            <div className="flex flex-col gap-2 shrink-0">
              <button
                type="button"
                onClick={onViewPreviousClaims}
                className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs hover:shadow cursor-pointer"
              >
                <Layers className="w-4 h-4 text-emerald-700" />
                <span>
                  {language === 'kn'
                    ? 'ನನ್ನ ಹಿಂದಿನ ಕ್ಲೇಮ್‌ಗಳನ್ನು ವೀಕ್ಷಿಸಿ (View Existing Claims)'
                    : 'View My Existing Claim Dossiers'}
                </span>
              </button>
              <div className="text-[11px] text-slate-500 text-center font-mono font-medium">
                {language === 'kn' ? 'ಐತಿಹಾಸಿಕ ಉಪಗ್ರಹ ಸಾಕ್ಷ್ಯ ಸಕ್ರಿಯ' : 'Historical satellite evidence active'}
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
        <div className="relative rounded-3xl bg-white border-2 border-emerald-500/70 p-6 md:p-8 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 group">
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold uppercase tracking-wider border border-emerald-300">
              <Sparkles className="w-3.5 h-3.5" /> {language === 'kn' ? 'ಆಯ್ಕೆ 1 (Option 1)' : 'Option 1'}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {language === 'kn' ? 'ನನ್ನ ULPIN ತಿಳಿದಿದೆ (I Know My ULPIN)' : 'I Know My ULPIN / ನನ್ನ ULPIN ತಿಳಿದಿದೆ'}
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  {language === 'kn' ? 'ನೇರ ಭೂ-ಆಧಾರ್ ನಮೂದು (Direct Cadastral Input)' : 'Direct Cadastral Input'}
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              {language === 'kn'
                ? 'ಬೆಳೆ ಹಾನಿ ಮೌಲ್ಯಮಾಪನ ಮುಂದುವರಿಸಲು ನಿಮ್ಮ ಜಮೀನಿನ 14-ಅಂಕಿಯ ULPIN ನಮೂದಿಸಿ. ನಾವು ಇದನ್ನು ರಾಷ್ಟ್ರೀಯ ಭೂ ದಾಖಲೆಗಳಲ್ಲಿ ತಕ್ಷಣ ಪರಿಶೀಲಿಸುತ್ತೇವೆ.'
                : "Enter your land's ULPIN to continue with crop damage assessment. We will instantly verify it against the National Cadastral Registry."}
            </p>

            {/* Input Form */}
            <form onSubmit={handleValidate} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="ulpin-input-field" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span>
                      {language === 'kn'
                        ? '14-ಅಕ್ಷರಗಳ ULPIN ಭೂ-ಆಧಾರ್ (14-Character ULPIN)'
                        : '14-Character ULPIN (Bhu-Aadhaar)'}
                    </span>
                    <span className="text-emerald-700">*</span>
                  </label>
                  <span className={`text-[11px] font-mono ${isFormatValid ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                    {cleanInput.length}/14 {language === 'kn' ? 'ಅಕ್ಷರಗಳು' : 'Characters'}
                  </span>
                </div>

                <div className="relative">
                  <input
                    id="ulpin-input-field"
                    type="text"
                    maxLength={14}
                    value={ulpinInput}
                    onChange={(e) => {
                      setUlpinInput(e.target.value.toUpperCase());
                      setErrorMsg(null);
                      setVerifiedLand(null);
                    }}
                    placeholder="e.g. 29BLR125200102"
                    className="w-full bg-slate-50 border-2 border-slate-300 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-4 py-3 text-slate-900 font-mono text-base tracking-widest placeholder:text-slate-400 transition outline-none"
                  />
                  {isFormatValid && (
                    <div className="absolute right-3.5 top-3 p-1 bg-emerald-100 text-emerald-800 rounded-lg">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>

              {/* Demo Pre-fill Chips for quick testing */}
              <div className="pt-1">
                <div className="text-[11px] text-slate-500 mb-1.5 font-semibold">
                  ⚡ {language === 'kn' ? 'ತ್ವರಿತ ಡೆಮೊ ಜಮೀನುಗಳು (Quick Demo Parcels):' : 'Quick Demo Parcels:'}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleUseDemo('29BLR125200102')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-emerald-800 text-xs font-mono rounded-lg border border-slate-200 transition cursor-pointer"
                  >
                    29BLR125200102 (Ravi - Survey 125/2)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUseDemo('29BEL048100108')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-emerald-800 text-xs font-mono rounded-lg border border-slate-200 transition cursor-pointer"
                  >
                    29BEL048100108 (Suresh - 48/1A)
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Continue / Validate Button */}
              {!verifiedLand && (
                <button
                  type="submit"
                  disabled={isValidating || !cleanInput}
                  className="w-full mt-4 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm tracking-wide shadow-xs hover:shadow flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  {isValidating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{language === 'kn' ? 'ಭೂಮಿ ದಾಖಲೆಗಳಲ್ಲಿ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...' : 'Verifying Land Registry...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{language === 'kn' ? 'ಪರಿಶೀಲಿಸಿ & ಮುಂದುವರಿಯಿರಿ (Verify & Continue)' : 'Continue'}</span>
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
            <div className="mt-6 pt-5 border-t border-emerald-200 animate-fadeIn">
              <div className="bg-emerald-50/80 border border-emerald-300 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-200 mb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                    <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                      {language === 'kn'
                        ? 'ಜಮೀನಿನ ವಿವರಗಳು ದೃಢೀಕರಿಸಲ್ಪಟ್ಟಿವೆ (Land Details Confirmed)'
                        : 'Land Details Confirmed'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-emerald-700 text-white">
                    {language === 'kn' ? 'ದೃಢೀಕೃತ (VERIFIED)' : 'VERIFIED'}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                      {language === 'kn' ? 'ಜಮೀನು ಮಾಲೀಕರು (Land Owner)' : 'Land Owner'}
                    </span>
                    <strong className="text-slate-900 text-sm">{verifiedLand.farmer_name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                      {language === 'kn' ? 'ಸರ್ವೆ ಸಂಖ್ಯೆ (Survey #)' : 'Survey Number'}
                    </span>
                    <strong className="text-emerald-800 font-mono text-sm">#{verifiedLand.survey_number}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                      {language === 'kn' ? 'ಸ್ಥಳ (Location)' : 'Location'}
                    </span>
                    <span className="text-slate-800 font-medium">{verifiedLand.village}, {verifiedLand.taluk}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                      {language === 'kn' ? 'ಜಿಲ್ಲೆ ಮತ್ತು ರಾಜ್ಯ' : 'District & State'}
                    </span>
                    <span className="text-slate-800 font-medium">{verifiedLand.district}, {verifiedLand.state}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                      {language === 'kn' ? 'ವಿಸ್ತೀರ್ಣ (Area)' : 'Area'}
                    </span>
                    <strong className="text-slate-900">{verifiedLand.area_acres} {language === 'kn' ? 'ಎಕರೆ (Acres)' : 'Acres'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                      {language === 'kn' ? 'ಡಿಜಿಪಿನ್ ಕೋಡ್ (DIGIPIN)' : 'DIGIPIN Code'}
                    </span>
                    <strong className="text-emerald-800 font-mono">{verifiedLand.digipin}</strong>
                  </div>
                </div>

                {/* Cadastral & GPS Badge */}
                <div className="mt-3 pt-2.5 border-t border-emerald-200 flex items-center justify-between text-[11px] text-emerald-800 font-mono font-medium">
                  <span>📍 GPS: {verifiedLand.latitude.toFixed(4)}°N, {verifiedLand.longitude.toFixed(4)}°E</span>
                  <span>🛰️ Sentinel-2 Active</span>
                </div>

                {/* Proceed Button */}
                <button
                  type="button"
                  onClick={() => onProceedToAssessment(verifiedLand)}
                  className="w-full mt-4 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs hover:shadow transition cursor-pointer"
                >
                  <span>
                    {language === 'kn'
                      ? 'ದೃಢೀಕರಿಸಿ & ಬೆಳೆ ಹಾನಿ ಮೌಲ್ಯಮಾಪನಕ್ಕೆ ತೆರಳಿ (Confirm & Continue)'
                      : 'Confirm & Continue to Crop Assessment'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* OPTION 2: FORGOT MY ULPIN CARD */}
        <div className="relative rounded-3xl bg-white border border-slate-200 p-6 md:p-8 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 group">
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-extrabold uppercase tracking-wider border border-amber-300">
              <Search className="w-3.5 h-3.5" /> {language === 'kn' ? 'ಆಯ್ಕೆ 2 (Option 2)' : 'Option 2'}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-amber-50 rounded-2xl text-amber-800 border border-amber-200">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-amber-800 transition-colors">
                  {language === 'kn' ? 'ULPIN ಮರೆತಿದೆ (Forgot My ULPIN)' : 'Forgot My ULPIN / ULPIN ಮರೆತಿದೆ'}
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  {language === 'kn' ? 'ಭೂಮಿ ದಾಖಲೆಗಳಿಂದ ಮರುಪಡೆಯಿರಿ (Bhoomi Recovery)' : 'Bhoomi Cadastral Recovery'}
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              {language === 'kn'
                ? 'ನಿಮ್ಮ ಜಮೀನಿನ ULPIN ತಿಳಿದಿಲ್ಲವೇ? ನಿಮ್ಮ ಹೆಸರು, ಜಿಲ್ಲೆ, ತಾಲೂಕು, ಗ್ರಾಮ ಮತ್ತು ಸರ್ವೆ ಸಂಖ್ಯೆಯನ್ನು ಬಳಸಿ ಕರ್ನಾಟಕ ಭೂಮಿ ಪೋರ್ಟಲ್‌ನಿಂದ ತಕ್ಷಣ ಮರುಪಡೆಯಿರಿ.'
                : "Don't know your ULPIN? Retrieve it using your land details. Search by your name, district, taluk, village, and survey number."}
            </p>

            {/* Feature highlights */}
            <div className="space-y-3 mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-3 text-xs text-slate-700 font-medium">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">
                  ✓
                </div>
                <span>
                  {language === 'kn'
                    ? 'ಕರ್ನಾಟಕ ಭೂಮಿ ದಾಖಲೆಗಳಿಂದ ತ್ವರಿತ ಶೋಧ (Instant retrieval from Bhoomi records)'
                    : 'Instant retrieval from State Land & Bhoomi records'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-700 font-medium">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">
                  ✓
                </div>
                <span>
                  {language === 'kn'
                    ? 'ಪಹಣಿ ಅಥವಾ ಭೌತಿಕ ದಾಖಲೆಗಳ ಅಪ್‌ಲೋಡ್ ಅಗತ್ಯವಿಲ್ಲ (No physical document upload needed)'
                    : 'No physical document upload or land passbook needed'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-700 font-medium">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">
                  ✓
                </div>
                <span>
                  {language === 'kn'
                    ? 'ಬೆಳೆ ಹಾನಿ ಮೌಲ್ಯಮಾಪನಕ್ಕೆ ನಿರ್ದೇಶಾಂಕಗಳು ನೇರ ಲಿಂಕ್ (Auto-populates coordinates)'
                    : 'Auto-populates coordinates directly into crop assessment'}
                </span>
              </div>
            </div>
          </div>

          {/* Retrieve ULPIN Action Button */}
          <div>
            <button
              type="button"
              onClick={onNavigateToForgotULPIN}
              className="w-full py-3.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-sm tracking-wide shadow-xs hover:shadow flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>
                {language === 'kn'
                  ? 'ಭೂಮಿ ದಾಖಲೆಗಳಿಂದ ULPIN ಪಡೆಯಿರಿ (Retrieve ULPIN)'
                  : 'Retrieve ULPIN from Land Records'}
              </span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
            <p className="text-[11px] text-slate-500 text-center mt-3">
              {language === 'kn'
                ? 'ನಿಮ್ಮ ಕೃಷಿ ಜಮೀನನ್ನು ಹುಡುಕಲು ೧೫ ಸೆಕೆಂಡುಗಳಿಗಿಂತ ಕಡಿಮೆ ಸಮಯ ತೆಗೆದುಕೊಳ್ಳುತ್ತದೆ'
                : 'Takes less than 15 seconds to look up your agricultural parcel'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
