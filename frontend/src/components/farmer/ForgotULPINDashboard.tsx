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
import { b, t } from '../../utils/translations';

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
    setMatchedRecords([]);
    setSelectedRecord(null);

    // 1. Validate mandatory fields
    if (!fullName.trim()) {
      setErrorMsg(language === 'kn' ? 'ಭೂ ದಾಖಲೆಗಳ ಪ್ರಕಾರ ಪೂರ್ಣ ಹೆಸರು ಕಡ್ಡಾಯವಾಗಿದೆ.' : 'Full Name is mandatory as per land records.');
      return;
    }
    if (!village.trim()) {
      setErrorMsg(language === 'kn' ? 'ಗ್ರಾಮದ ಹೆಸರು ಕಡ್ಡಾಯವಾಗಿದೆ.' : 'Village name is mandatory.');
      return;
    }
    if (!taluk.trim()) {
      setErrorMsg(language === 'kn' ? 'ತಾಲೂಕಿನ ಹೆಸರು ಕಡ್ಡಾಯವಾಗಿದೆ.' : 'Taluk name is mandatory.');
      return;
    }
    if (!district.trim()) {
      setErrorMsg(language === 'kn' ? 'ಜಿಲ್ಲೆಯ ಹೆಸರು ಕಡ್ಡಾಯವಾಗಿದೆ.' : 'District name is mandatory.');
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const res = await retrieveULPIN({
        full_name: fullName.trim(),
        village: village.trim(),
        taluk: taluk.trim(),
        district: district.trim(),
        survey_number: surveyNumber.trim() || undefined
      });

      const matches = res.records || [];
      if (matches && matches.length > 0) {
        setMatchedRecords(matches);
        if (matches.length === 1) {
          // Exactly one match found
          setSelectedRecord(matches[0]);
        }
      } else {
        setErrorMsg(language === 'kn' ? 'ಹೊಂದಿಕೆಯಾಗುವ ಭೂ ದಾಖಲೆ ಕಂಡುಬಂದಿಲ್ಲ. ದಯವಿಟ್ಟು ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.' : 'No matching land record found. Please verify your details.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || (language === 'kn' ? 'ಭೂ ದಾಖಲೆಗಳ ಸರ್ವರ್ ದೋಷ. ದಯವಿಟ್ಟು ಪುನಃ ಪ್ರಯತ್ನಿಸಿ.' : 'Error querying land records database. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedULPIN(true);
    setTimeout(() => setCopiedULPIN(false), 2500);
  };

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
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <button
          type="button"
          onClick={onBackToDashboard}
          className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-300 shadow-xs transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-700" />
          <span>{b('Back to Land Identification', 'ಭೂಮಿ ಗುರುತಿಸುವಿಕೆಗೆ ಹಿಂತಿರುಗಿ', language)}</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>{b('Official Cadastral Recovery Gateway', 'ಅಧಿಕೃತ ಭೂ ಕಂದಾಯ ಮರುಪಡೆಯುವಿಕೆ ಗೇಟ್‌ವೇ', language)}</span>
        </div>
      </div>

      {/* Main Titles */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <span className="p-2.5 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-xl">
            🔍
          </span>
          <span>{b('Recover Your ULPIN', 'ನಿಮ್ಮ ULPIN ಮರುಪಡೆಯಿರಿ', language)}</span>
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          {b(
            'Enter your personal and agricultural land details to retrieve your ULPIN from official Bhoomi and State Land Records.',
            'ಅಧಿಕೃತ ಭೂಮಿ ಮತ್ತು ರಾಜ್ಯ ಭೂ ದಾಖಲೆಗಳಿಂದ ನಿಮ್ಮ ULPIN ಪಡೆಯಲು ವೈಯಕ್ತಿಕ ಮತ್ತು ಕೃಷಿ ಭೂಮಿಯ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ.',
            language
          )}
        </p>
      </div>

      {/* Demo Presets Bar */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-600 font-semibold flex items-center gap-1.5 mr-1">
          <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
          <span>{b('Quick Demo Presets:', 'ಡೆಮೊ ಮಾದರಿಗಳು:', language)}</span>
        </span>
        <button
          type="button"
          onClick={() => loadPreset({ fn: 'Ravi Kumar', dist: 'Bengaluru Rural', tal: 'Devanahalli', vill: 'Devanahalli', surv: '125/2' })}
          className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-mono rounded-lg border border-slate-200 transition cursor-pointer"
        >
          {b('Preset 1: Ravi Kumar (Survey 125/2)', 'ಮಾದರಿ 1: ರವಿ ಕುಮಾರ್ (ಸರ್ವೆ 125/2)', language)}
        </button>
        <button
          type="button"
          onClick={() => loadPreset({ fn: 'Ravi Kumar', dist: 'Bengaluru Rural', tal: 'Devanahalli', vill: 'Devanahalli', surv: '' })}
          className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-mono rounded-lg border border-slate-200 transition cursor-pointer"
        >
          {b('Preset 2: Multi-Plot Test (No Survey #)', 'ಮಾದರಿ 2: ಬಹು-ಪ್ಲಾಟ್ (ಸರ್ವೆ ನಂ ಇಲ್ಲದೆ)', language)}
        </button>
        <button
          type="button"
          onClick={() => loadPreset({ fn: 'Suresh Patil', dist: 'Belagavi', tal: 'Chikkodi', vill: 'Chikkodi', surv: '48/1A' })}
          className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-700 text-xs font-mono rounded-lg border border-slate-200 transition cursor-pointer"
        >
          {b('Preset 3: Suresh Patil (Chikkodi)', 'ಮಾದರಿ 3: ಸುರೇಶ್ ಪಾಟೀಲ್ (ಚಿಕ್ಕೋಡಿ)', language)}
        </button>
      </div>

      {/* ============================================================== */}
      {/* 2. RECOVERY FORM CARD                                          */}
      {/* ============================================================== */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <form onSubmit={handleFetchULPIN} className="space-y-5">
          {/* Row 1: Full Name (Mandatory) */}
          <div>
            <label htmlFor="recovery-full-name" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-700" />
                <span>{b('1. Full Name (As per Land Records)', '1. ಪೂರ್ಣ ಹೆಸರು (ಭೂ ದಾಖಲೆಗಳ ಪ್ರಕಾರ)', language)}</span>
              </span>
              <span className="text-[10px] text-emerald-800 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {b('MANDATORY *', 'ಕಡ್ಡಾಯ *', language)}
              </span>
            </label>
            <input
              id="recovery-full-name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={b('e.g. Ravi Kumar', 'ಉದಾ: ರವಿ ಕುಮಾರ್', language)}
              className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-4 py-2.5 sm:py-3 text-slate-900 text-sm transition outline-none"
            />
          </div>

          {/* Row 2: District & Taluk (Mandatory) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="recovery-district" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{b('2. District', '2. ಜಿಲ್ಲೆ', language)}</span>
                </span>
                <span className="text-[10px] text-emerald-800 font-mono font-bold">{b('MANDATORY *', 'ಕಡ್ಡಾಯ *', language)}</span>
              </label>
              <input
                id="recovery-district"
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder={b('e.g. Bengaluru Rural', 'ಉದಾ: ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ', language)}
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-4 py-2.5 sm:py-3 text-slate-900 text-sm transition outline-none"
              />
            </div>

            <div>
              <label htmlFor="recovery-taluk" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{b('3. Taluk', '3. ತಾಲೂಕು', language)}</span>
                </span>
                <span className="text-[10px] text-emerald-800 font-mono font-bold">{b('MANDATORY *', 'ಕಡ್ಡಾಯ *', language)}</span>
              </label>
              <input
                id="recovery-taluk"
                type="text"
                required
                value={taluk}
                onChange={(e) => setTaluk(e.target.value)}
                placeholder={b('e.g. Devanahalli', 'ಉದಾ: ದೇವನಹಳ್ಳಿ', language)}
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-4 py-2.5 sm:py-3 text-slate-900 text-sm transition outline-none"
              />
            </div>
          </div>

          {/* Row 3: Village (Mandatory) & Survey Number (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="recovery-village" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{b('4. Village', '4. ಗ್ರಾಮ / ಹಳ್ಳಿ', language)}</span>
                </span>
                <span className="text-[10px] text-emerald-800 font-mono font-bold">{b('MANDATORY *', 'ಕಡ್ಡಾಯ *', language)}</span>
              </label>
              <input
                id="recovery-village"
                type="text"
                required
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder={b('e.g. Devanahalli', 'ಉದಾ: ದೇವನಹಳ್ಳಿ', language)}
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-4 py-2.5 sm:py-3 text-slate-900 text-sm transition outline-none"
              />
            </div>

            <div>
              <label htmlFor="recovery-survey" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-slate-500" />
                  <span>{b('5. Survey Number', '5. ಸರ್ವೆ ಸಂಖ್ಯೆ', language)}</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{b('OPTIONAL', 'ಐಚ್ಛಿಕ', language)}</span>
              </label>
              <input
                id="recovery-survey"
                type="text"
                value={surveyNumber}
                onChange={(e) => setSurveyNumber(e.target.value)}
                placeholder={b('e.g. 125/2 (leave blank to see all plots)', 'ಉದಾ: 125/2 (ಎಲ್ಲಾ ಜಮೀನು ನೋಡಲು ಖಾಲಿ ಬಿಡಿ)', language)}
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-4 py-2.5 sm:py-3 text-slate-900 text-sm transition outline-none"
              />
            </div>
          </div>

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <div>
                <strong>{errorMsg}</strong>
                <p className="text-[11px] text-red-600/90 mt-0.5">
                  {b(
                    'Please verify the spelling of your Full Name, Taluk, and Village, or check if the Survey Number is correct.',
                    'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಹೆಸರು, ತಾಲೂಕು ಮತ್ತು ಗ್ರಾಮದ ಕಾಗುಣಿತವನ್ನು ಅಥವಾ ಸರ್ವೆ ಸಂಖ್ಯೆಯನ್ನು ಪರಿಶೀಲಿಸಿ.',
                    language
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:flex-1 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm tracking-wide shadow-xs hover:shadow flex items-center justify-center gap-2 transition cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{b('Searching Cadastral Land Records...', 'ಭೂ ದಾಖಲೆಗಳನ್ನು ಹುಡುಕಲಾಗುತ್ತಿದೆ...', language)}</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>{b('Fetch ULPIN', 'ULPIN ಹುಡುಕಿ', language)}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onBackToDashboard}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
            >
              {b('Back to Dashboard', 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂತಿರುಗಿ', language)}
            </button>
          </div>
        </form>
      </div>

      {/* ============================================================== */}
      {/* 3. MULTIPLE MATCHING RECORDS SELECTION                         */}
      {/* ============================================================== */}
      {matchedRecords.length > 1 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="p-1.5 bg-emerald-50 text-emerald-800 rounded-lg">📋</span>
                <span>
                  {b(
                    `Multiple Land Records Found (${matchedRecords.length} Parcels)`,
                    `ಹಲವಾರು ಭೂ ದಾಖಲೆಗಳು ಕಂಡುಬಂದಿವೆ (${matchedRecords.length} ಜಮೀನುಗಳು)`,
                    language
                  )}
                </span>
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                {b(
                  `We found ${matchedRecords.length} agricultural land parcels registered under `,
                  `${village} ಗ್ರಾಮದಲ್ಲಿ `,
                  language
                )}
                <strong>{fullName}</strong>
                {b(
                  ` in ${village}. Please select the parcel for crop damage assessment:`,
                  ` ಅವರ ಹೆಸರಿನಲ್ಲಿ ${matchedRecords.length} ಕೃಷಿ ಜಮೀನುಗಳು ಕಂಡುಬಂದಿವೆ. ಬೆಳೆ ಹಾನಿ ಮೌಲ್ಯಮಾಪನಕ್ಕೆ ಸಂಬಂಧಿತ ಜಮೀನನ್ನು ಆಯ್ಕೆಮಾಡಿ:`,
                  language
                )}
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
                      ? 'bg-emerald-50/80 border-emerald-600 shadow-sm scale-[1.01]'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                        {b('Survey #', 'ಸರ್ವೆ ಸಂಖ್ಯೆ #', language)}{rec.survey_number}
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        {rec.area_acres} {b('Acres', 'ಎಕರೆ', language)}
                      </span>
                    </div>

                    <div className="text-sm font-bold text-slate-900 mb-1">
                      {rec.land_type}
                    </div>

                    <div className="text-xs text-slate-500">
                      {rec.village}, {rec.taluk}, {rec.district}
                    </div>

                    <div className="mt-3 p-2 bg-white rounded-xl font-mono text-[11px] text-emerald-800 tracking-wider flex items-center justify-between border border-slate-200">
                      <span>ULPIN: {rec.ulpin}</span>
                      {isSelected && <Check className="w-4 h-4 text-emerald-700" />}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">DIGIPIN: {rec.digipin}</span>
                    <span className={`font-bold ${isSelected ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {isSelected
                        ? b('✓ Selected', '✓ ಆಯ್ಕೆಯಾಗಿದೆ', language)
                        : b('Click to Select', 'ಆಯ್ಕೆ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ', language)}
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
        <div className="bg-gradient-to-b from-emerald-50/80 via-white to-green-50/60 border-2 border-emerald-400 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 animate-fadeIn">
          {/* Header Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-emerald-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-xs">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-300 mb-1">
                  {b('National Bhoomi Cadastral Match', 'ರಾಷ್ಟ್ರೀಯ ಭೂಮಿ ದಾಖಲೆ ಹೊಂದಾಣಿಕೆ', language)}
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {b('ULPIN Retrieved Successfully!', 'ULPIN ಯಶಸ್ವಿಯಾಗಿ ದೊರೆತಿದೆ!', language)}
                </h2>
              </div>
            </div>

            <div className="text-left sm:text-right font-mono text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 font-bold">
              {b('Verified & Co-Registered', 'ಪರಿಶೀಲಿಸಲಾಗಿದೆ & ನೋಂದಾಯಿಸಲಾಗಿದೆ', language)}
            </div>
          </div>

          {/* Highlighted ULPIN Display Box */}
          <div className="p-5 rounded-2xl bg-white border border-emerald-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block mb-1">
                {b('Unique Land Parcel Identification Number (Bhu-Aadhaar)', 'ವಿಶಿಷ್ಟ ಭೂಮಿ ಗುರುತಿನ ಸಂಖ್ಯೆ (ಭೂ-ಆಧಾರ್)', language)}
              </span>
              <div className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-emerald-800">
                {selectedRecord.ulpin}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleCopy(selectedRecord.ulpin)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 border border-slate-300 transition cursor-pointer shrink-0"
            >
              {copiedULPIN ? (
                <>
                  <Check className="w-4 h-4 text-emerald-700" />
                  <span>{b('Copied to Clipboard!', 'ನಕಲಿಸಲಾಗಿದೆ!', language)}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>{b('Copy ULPIN', 'ULPIN ನಕಲಿಸಿ', language)}</span>
                </>
              )}
            </button>
          </div>

          {/* Verified Land Record Detail Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                {b("Farmer's Full Name", 'ರೈತರ ಪೂರ್ಣ ಹೆಸರು', language)}
              </span>
              <strong className="text-slate-900 text-sm">{selectedRecord.farmer_name}</strong>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                {b('Survey Number', 'ಸರ್ವೆ ಸಂಖ್ಯೆ', language)}
              </span>
              <strong className="text-emerald-800 font-mono text-sm">#{selectedRecord.survey_number}</strong>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                {b('Village', 'ಗ್ರಾಮ / ಊರು', language)}
              </span>
              <strong className="text-slate-800">{selectedRecord.village}</strong>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                {b('Taluk & District', 'ತಾಲೂಕು & ಜಿಲ್ಲೆ', language)}
              </span>
              <span className="text-slate-700 font-medium">{selectedRecord.taluk}, {selectedRecord.district}</span>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                {b('Registered Area', 'ನೋಂದಾಯಿತ ವಿಸ್ತೀರ್ಣ', language)}
              </span>
              <strong className="text-slate-900">{selectedRecord.area_acres} {b('Acres', 'ಎಕರೆ', language)}</strong>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                {b('National DIGIPIN', 'ರಾಷ್ಟ್ರೀಯ ಡಿಜಿಪಿನ್', language)}
              </span>
              <strong className="text-emerald-800 font-mono">{selectedRecord.digipin}</strong>
            </div>

            <div className="col-span-2">
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                {b('GPS Centroid Coordinates', 'ಜಿಪಿಎಸ್ ನಿರ್ದೇಶಾಂಕಗಳು', language)}
              </span>
              <span className="text-slate-700 font-mono">
                {selectedRecord.latitude.toFixed(5)}° N, {selectedRecord.longitude.toFixed(5)}° E
              </span>
            </div>
          </div>

          {/* Action Buttons: Continue to Crop Assessment / Back */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onContinueToAssessment(selectedRecord)}
              className="w-full sm:flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-xs hover:shadow transition cursor-pointer"
            >
              <span>{b('Continue to Crop Assessment', 'ಬೆಳೆ ಹಾನಿ ಮೌಲ್ಯಮಾಪನಕ್ಕೆ ಮುಂದುವರಿಯಿರಿ', language)}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRecord(null);
                setMatchedRecords([]);
                setHasSearched(false);
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
            >
              {b('Back', 'ಹಿಂದೆ', language)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
