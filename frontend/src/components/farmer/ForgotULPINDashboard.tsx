import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Search,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Layers,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Building,
  User,
  Hash,
  ShieldCheck
} from 'lucide-react';
import { OfficialLandRecord } from '../../types';
import { retrieveULPIN } from '../../services/api';

interface Props {
  currentUser?: any;
  language: 'en' | 'kn';
  onBackToDashboard: () => void;
  onContinueToAssessment: (land: OfficialLandRecord) => void;
}

export const ForgotULPINDashboard: React.FC<Props> = ({
  currentUser,
  language,
  onBackToDashboard,
  onContinueToAssessment
}) => {
  // Input form state (defaults populated from user or clean)
  const [fullName, setFullName] = useState<string>(currentUser?.name || 'Ravi Kumar');
  const [district, setDistrict] = useState<string>(currentUser?.district || 'Bengaluru Rural');
  const [taluk, setTaluk] = useState<string>('Devanahalli');
  const [village, setVillage] = useState<string>(currentUser?.village || 'Devanahalli');
  const [surveyNumber, setSurveyNumber] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Results state
  const [matchedRecords, setMatchedRecords] = useState<OfficialLandRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<OfficialLandRecord | null>(null);
  const [copiedULPIN, setCopiedULPIN] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const handleFetchULPIN = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setCopiedULPIN(false);
    setSelectedRecord(null);
    setMatchedRecords([]);

    const fn = fullName.trim();
    const vill = village.trim();
    const tal = taluk.trim();
    const dist = district.trim();

    // 1. Mandatory field validation
    if (!fn) {
      setErrorMsg('Full Name is mandatory.');
      return;
    }
    if (!dist) {
      setErrorMsg('District is mandatory.');
      return;
    }
    if (!tal) {
      setErrorMsg('Taluk is mandatory.');
      return;
    }
    if (!vill) {
      setErrorMsg('Village is mandatory.');
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const res = await retrieveULPIN({
        full_name: fn,
        village: vill,
        taluk: tal,
        district: dist,
        survey_number: surveyNumber.trim() || undefined
      });

      if (res.success && res.records && res.records.length > 0) {
        setMatchedRecords(res.records);
        if (res.records.length === 1) {
          setSelectedRecord(res.records[0]);
        }
      } else {
        setErrorMsg(res.message || 'No matching land record found. Please verify your details.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'No matching land record found. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedULPIN(true);
    setTimeout(() => setCopiedULPIN(false), 2500);
  };

  // Demo presets for easy testing
  const loadPreset = (preset: { fn: string; dist: string; tal: string; vill: string; surv: string }) => {
    setFullName(preset.fn);
    setDistrict(preset.dist);
    setTaluk(preset.tal);
    setVillage(preset.vill);
    setSurveyNumber(preset.surv);
    setErrorMsg(null);
    setHasSearched(false);
    setMatchedRecords([]);
    setSelectedRecord(null);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* ============================================================== */}
      {/* 1. TOP HEADER & NAVIGATION                                      */}
      {/* ============================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <button
          type="button"
          onClick={onBackToDashboard}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-800 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400" />
          <span>Back to Land Identification</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
          <ShieldCheck className="w-4 h-4" />
          <span>Official Cadastral Recovery Gateway</span>
        </div>
      </div>

      {/* Main Titles */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <span className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-2xl border border-cyan-500/30 text-xl">
            🔍
          </span>
          <span>Recover Your ULPIN</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Enter your personal and agricultural land details to retrieve your ULPIN from official Bhoomi and State Land Records.
        </p>
      </div>

      {/* Demo Presets Bar */}
      <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 mr-1">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Quick Demo Presets:</span>
        </span>
        <button
          type="button"
          onClick={() => loadPreset({ fn: 'Ravi Kumar', dist: 'Bengaluru Rural', tal: 'Devanahalli', vill: 'Devanahalli', surv: '125/2' })}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-mono rounded-lg border border-emerald-500/30 transition cursor-pointer"
        >
          Preset 1: Ravi Kumar (Survey 125/2)
        </button>
        <button
          type="button"
          onClick={() => loadPreset({ fn: 'Ravi Kumar', dist: 'Bengaluru Rural', tal: 'Devanahalli', vill: 'Devanahalli', surv: '' })}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono rounded-lg border border-cyan-500/30 transition cursor-pointer"
        >
          Preset 2: Multi-Plot Test (No Survey #)
        </button>
        <button
          type="button"
          onClick={() => loadPreset({ fn: 'Suresh Patil', dist: 'Belagavi', tal: 'Chikkodi', vill: 'Chikkodi', surv: '48/1A' })}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono rounded-lg border border-slate-700 transition cursor-pointer"
        >
          Preset 3: Suresh Patil (Chikkodi)
        </button>
      </div>

      {/* ============================================================== */}
      {/* 2. RECOVERY FORM CARD                                          */}
      {/* ============================================================== */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <form onSubmit={handleFetchULPIN} className="space-y-5">
          {/* Row 1: Full Name (Mandatory) */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>1. Full Name (As per Land Records)</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                MANDATORY *
              </span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Ravi Kumar"
              className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-400 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition"
            />
          </div>

          {/* Row 2: District & Taluk (Mandatory) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>2. District</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">MANDATORY *</span>
              </label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. Bengaluru Rural"
                className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-400 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-emerald-400" />
                  <span>3. Taluk</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">MANDATORY *</span>
              </label>
              <input
                type="text"
                required
                value={taluk}
                onChange={(e) => setTaluk(e.target.value)}
                placeholder="e.g. Devanahalli"
                className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-400 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition"
              />
            </div>
          </div>

          {/* Row 3: Village (Mandatory) & Survey Number (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>4. Village</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">MANDATORY *</span>
              </label>
              <input
                type="text"
                required
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="e.g. Devanahalli"
                className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-400 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-cyan-400" />
                  <span>5. Survey Number</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">OPTIONAL</span>
              </label>
              <input
                type="text"
                value={surveyNumber}
                onChange={(e) => setSurveyNumber(e.target.value)}
                placeholder="e.g. 125/2 (leave blank to see all plots)"
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-4 focus:ring-cyan-500/20 transition"
              />
            </div>
          </div>

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="p-4 bg-rose-950/70 border border-rose-500/50 rounded-2xl text-rose-300 text-xs flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div>
                <strong>{errorMsg}</strong>
                <p className="text-[11px] text-rose-300/80 mt-0.5">
                  Please verify the spelling of your Full Name, Taluk, and Village, or verify if the Survey Number is correct.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:flex-1 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-sm tracking-wide shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Searching Cadastral Land Records...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Fetch ULPIN</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onBackToDashboard}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>
        </form>
      </div>

      {/* ============================================================== */}
      {/* 3. MULTIPLE MATCHING RECORDS SELECTION                         */}
      {/* ============================================================== */}
      {matchedRecords.length > 1 && (
        <div className="bg-slate-900/90 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="p-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg">📋</span>
                <span>Multiple Land Records Found ({matchedRecords.length} Parcels)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                We found {matchedRecords.length} agricultural land parcels registered under <strong>{fullName}</strong> in {village}. Please select the parcel for crop damage assessment:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchedRecords.map((rec) => {
              const isSelected = selectedRecord?.ulpin === rec.ulpin;
              return (
                <div
                  key={rec.ulpin}
                  onClick={() => setSelectedRecord(rec)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-950/80 border-emerald-400 shadow-lg shadow-emerald-500/20 scale-[1.01]'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                        Survey #{rec.survey_number}
                      </span>
                      <span className="text-xs font-bold text-slate-300">
                        {rec.area_acres} Acres
                      </span>
                    </div>

                    <div className="text-sm font-bold text-white mb-1">
                      {rec.land_type}
                    </div>

                    <div className="text-xs text-slate-400">
                      {rec.village}, {rec.taluk}, {rec.district}
                    </div>

                    <div className="mt-3 p-2 bg-slate-900 rounded-xl font-mono text-[11px] text-cyan-300 tracking-wider flex items-center justify-between border border-slate-800">
                      <span>ULPIN: {rec.ulpin}</span>
                      {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">DIGIPIN: {rec.digipin}</span>
                    <span className={`font-bold ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {isSelected ? '✓ Selected' : 'Click to Select'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. SUCCESSFUL RETRIEVAL UI CARD                                */}
      {/* ============================================================== */}
      {selectedRecord && (
        <div className="bg-gradient-to-b from-emerald-950/90 via-slate-900 to-slate-900 border-2 border-emerald-400 rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(16,185,129,0.2)] space-y-6 animate-fadeIn">
          
          {/* Header Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-emerald-500/30">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500 text-slate-950 rounded-2xl shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-500/40 mb-1">
                  National Bhoomi Cadastral Match
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  ULPIN Retrieved Successfully!
                </h2>
              </div>
            </div>

            <div className="text-left sm:text-right font-mono text-xs text-emerald-400 bg-emerald-950 px-3 py-1.5 rounded-xl border border-emerald-500/30">
              Verified & Co-Registered
            </div>
          </div>

          {/* Highlighted ULPIN Display Box */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/40 shadow-inner flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block mb-1">
                Unique Land Parcel Identification Number (Bhu-Aadhaar)
              </span>
              <div className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                {selectedRecord.ulpin}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleCopy(selectedRecord.ulpin)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 border border-emerald-500/30 transition cursor-pointer shrink-0"
            >
              {copiedULPIN ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy ULPIN</span>
                </>
              )}
            </button>
          </div>

          {/* Verified Land Record Detail Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/20 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">Farmer's Full Name</span>
              <strong className="text-white text-sm">{selectedRecord.farmer_name}</strong>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px]">Survey Number</span>
              <strong className="text-emerald-300 font-mono text-sm">#{selectedRecord.survey_number}</strong>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px]">Village</span>
              <strong className="text-slate-200">{selectedRecord.village}</strong>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px]">Taluk & District</span>
              <span className="text-slate-200">{selectedRecord.taluk}, {selectedRecord.district}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px]">Registered Area</span>
              <strong className="text-white">{selectedRecord.area_acres} Acres</strong>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px]">National DIGIPIN</span>
              <strong className="text-cyan-300 font-mono">{selectedRecord.digipin}</strong>
            </div>

            <div className="col-span-2">
              <span className="text-slate-400 block text-[10px]">GPS Centroid Coordinates</span>
              <span className="text-slate-300 font-mono">
                {selectedRecord.latitude.toFixed(5)}° N, {selectedRecord.longitude.toFixed(5)}° E
              </span>
            </div>
          </div>

          {/* Action Buttons: Continue to Crop Assessment / Back */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onContinueToAssessment(selectedRecord)}
              className="w-full sm:flex-1 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-400 hover:to-green-300 text-slate-950 font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-2xl shadow-emerald-500/40 transition cursor-pointer"
            >
              <span>Continue to Crop Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRecord(null);
                setMatchedRecords([]);
                setHasSearched(false);
              }}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
