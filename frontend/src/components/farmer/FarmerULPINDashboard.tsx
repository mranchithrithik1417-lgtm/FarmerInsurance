import React, { useState, useEffect, useRef } from 'react';
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
  RefreshCw,
  Mic,
  MicOff,
  Volume2,
  VolumeX
} from 'lucide-react';
import { OfficialLandRecord } from '../../types';
import { validateULPIN } from '../../services/api';
import { t, b } from '../../utils/translations';
import {
  speakAloud,
  stopSpeaking,
  primeSpeechSynthesis,
  playChime,
  parseSpokenULPIN
} from '../../utils/speech';

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

  // Voice Guidance & Speech Recognition State
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [spokenTranscript, setSpokenTranscript] = useState<string>('');
  const [lastParsedSummary, setLastParsedSummary] = useState<string>('');
  const recognitionRef = useRef<any>(null);

  const farmerName = currentUser?.name || 'Ravi Kumar';

  // Guidance texts
  const introPromptEn = "Welcome to KisanClaim! To begin, please enter or speak your 14-character ULPIN Bhu-Aadhaar number, or select Retrieve ULPIN if you forgot it.";
  const introPromptKn = "ಸ್ವಾಗತ! ನಿಮ್ಮ ಕೃಷಿ ಜಮೀನನ್ನು ಗುರುತಿಸಲು ನಿಮ್ಮ 14-ಅಂಕಿಯ ULPIN ಭೂ-ಆಧಾರ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ ಅಥವಾ ಮಾತನಾಡಿ, ಇಲ್ಲವೇ ನೀವು ಮರೆತಿದ್ದರೆ ULPIN ಮರುಪಡೆಯಿರಿ ಆಯ್ಕೆಮಾಡಿ.";

  const verifiedPromptEn = verifiedLand
    ? `Land details confirmed for ${verifiedLand.farmer_name}, Survey Number ${verifiedLand.survey_number}, in ${verifiedLand.village}, ${verifiedLand.district}. Click Confirm and Continue to begin your 5-step Crop Loss Assessment.`
    : "Your land details have been verified. Click Confirm and Continue to proceed to Crop Loss Assessment.";
  const verifiedPromptKn = "ನಿಮ್ಮ ಜಮೀನಿನ ಅಧಿಕೃತ ವಿವರಗಳು ದೃಢೀಕರಿಸಲ್ಪಟ್ಟಿವೆ. ನಿಮ್ಮ 5-ಹಂತದ ಬೆಳೆ ಹಾನಿ ಮೌಲ್ಯಮಾಪನ ಆರಂಭಿಸಲು ದೃಢೀಕರಿಸಿ ಮತ್ತು ಮುಂದುವರಿಯಿರಿ ಕ್ಲಿಕ್ ಮಾಡಿ.";

  // Speak guidance helper
  const speakGuidance = (text: string) => {
    if (!voiceEnabled) return;
    speakAloud(text, {
      lang: language === 'kn' ? 'kn-IN' : 'en-IN',
      rate: 0.95,
      pitch: 1.0,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false)
    });
  };

  const toggleSpeak = () => {
    primeSpeechSynthesis();
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      const prompt = verifiedLand
        ? (language === 'kn' ? verifiedPromptKn : verifiedPromptEn)
        : (language === 'kn' ? introPromptKn : introPromptEn);
      speakGuidance(prompt);
    }
  };

  // Auto-speak guidance when landing or when verifiedLand updates
  useEffect(() => {
    if (voiceEnabled) {
      const prompt = verifiedLand
        ? (language === 'kn' ? verifiedPromptKn : verifiedPromptEn)
        : (language === 'kn' ? introPromptKn : introPromptEn);
      const timer = setTimeout(() => {
        speakGuidance(prompt);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [voiceEnabled, language, verifiedLand]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (recognitionRef.current?.stop) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

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
        playChime('success');
      } else {
        setErrorMsg(res.message || (language === 'kn' ? 'ಈ ULPIN ಗೆ ಯಾವುದೇ ಭೂಮಿ ದಾಖಲೆ ಕಂಡುಬಂದಿಲ್ಲ.' : 'No cadastral land record found for this ULPIN.'));
      }
    } catch (err: any) {
      setErrorMsg(err.message || (language === 'kn' ? 'ULPIN ಪರಿಶೀಲಿಸುವಲ್ಲಿ ದೋಷ ಕಂಡುಬಂದಿದೆ.' : 'Error validating ULPIN. Please check your internet connection.'));
    } finally {
      setIsValidating(false);
    }
  };

  // Speech Recognition Handler for ULPIN
  const toggleListening = () => {
    primeSpeechSynthesis();
    if (isListening) {
      if (recognitionRef.current?.stop) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setErrorMsg(language === 'kn' 
        ? 'ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ. ದಯವಿಟ್ಟು ಡೆಮೊ ಬಟನ್ ಬಳಸಿ.' 
        : 'Speech recognition is not supported in this browser. Please use quick sample buttons.');
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'kn' ? 'kn-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMsg(null);
        setSpokenTranscript('');
        playChime('start');
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setSpokenTranscript(transcript);

        const parsed = parseSpokenULPIN(transcript);
        if (parsed) {
          setUlpinInput(parsed);
          setLastParsedSummary(`✓ Spoken ULPIN: ${parsed}`);
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech error:', e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        playChime('success');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Recognition start error:', err);
      setIsListening(false);
    }
  };

  const handleUseDemo = (demoCode: string) => {
    setUlpinInput(demoCode);
    setErrorMsg(null);
    setVerifiedLand(null);
    setLastParsedSummary(`✓ Selected Demo ULPIN: ${demoCode}`);
    playChime('success');
  };

  const handleQuickVoiceAnswer = (sampleText: string, sampleUlpin: string) => {
    primeSpeechSynthesis();
    setSpokenTranscript(sampleText);
    setUlpinInput(sampleUlpin);
    setErrorMsg(null);
    setVerifiedLand(null);
    setLastParsedSummary(`✓ Voice Fill: ${sampleUlpin}`);
    playChime('success');
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* ============================================================== */}
      {/* 1. TOP WELCOME & CADASTRAL IDENTIFICATION HERO BANNER         */}
      {/* ============================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl p-6 md:p-8 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-950/20 via-transparent to-blue-950/20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 text-xs font-bold mb-3">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>
                {language === 'kn'
                  ? 'ರಾಷ್ಟ್ರೀಯ ಭೂ-ಆಧಾರ್ • ULPIN ಜಮೀನು ನೋಂದಣಿ ಏಕೀಕರಣ (National Bhu-Aadhaar)'
                  : 'National Bhu-Aadhaar • ULPIN Land Registry Integration'}
              </span>
            </div>

            {/* Official KisanClaim Brand Logo + Welcome */}
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-900/40 text-2xl font-black">
                🌾
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {language === 'kn'
                    ? `ಕಿಸಾನ್‌ಕ್ಲೇಮ್‌ಗೆ ಸ್ವಾಗತ, ${farmerName}! (Welcome, ${farmerName}!)`
                    : `Welcome to KisanClaim, ${farmerName}!`}
                </h1>
                <p className="text-xs text-cyan-400 font-medium">
                  {language === 'kn'
                    ? 'ಪಿಎಂಎಫ್‌ಬಿವೈ ಎಐ ಬೆಳೆ ಹಾನಿ ಪುರಾವೆ ಮತ್ತು ಜಮೀನು ನೋಂದಣಿ ವೇದಿಕೆ'
                    : 'PMFBY AI Crop Loss Telemetry & Land Co-Registration'}
                </p>
              </div>
            </div>

            {/* Main Prompt Heading */}
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-3">
              {language === 'kn'
                ? 'ನಿಮ್ಮ ಕೃಷಿ ಭೂಮಿಯನ್ನು ಗುರುತಿಸಿ / Identify Your Agricultural Land'
                : 'Identify Your Agricultural Land / ನಿಮ್ಮ ಕೃಷಿ ಭೂಮಿಯನ್ನು ಗುರುತಿಸಿ'}
            </h2>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              {language === 'kn' ? (
                <>
                  ಭಾರತದಲ್ಲಿನ ಪ್ರತಿಯೊಂದು ಕೃಷಿ ಭೂಮಿಗೆ 14-ಅಂಕಿಯ{' '}
                  <strong className="text-cyan-300 font-semibold">ವಿಶಿಷ್ಟ ಭೂಮಿ ಪಾರ್ಸೆಲ್ ಗುರುತಿನ ಸಂಖ್ಯೆ (ULPIN / ಭೂ-ಆಧಾರ್)</strong> ನೀಡಲಾಗಿದೆ.
                  ನಿಮ್ಮ ULPIN ಸಂಪರ್ಕಿಸುವುದರಿಂದ ಗಡಿಗಳು, ಡಿಜಿಪಿನ್ ನಿರ್ದೇಶಾಂಕಗಳು ಮತ್ತು ಸೆಂಟಿನೆಲ್-2 ಉಪಗ್ರಹ ಸಾಕ್ಷ್ಯಗಳು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಜೋಡಣೆಯಾಗುತ್ತವೆ.
                </>
              ) : (
                <>
                  Every agricultural land parcel in India is assigned a 14-digit geospatial{' '}
                  <strong className="text-cyan-300 font-semibold">Unique Land Parcel Identification Number (ULPIN / Bhu-Aadhaar)</strong>. 
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
                className="px-5 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-cyan-300 border border-cyan-800/60 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer hover:border-cyan-500"
              >
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>
                  {language === 'kn'
                    ? 'ನನ್ನ ಹಿಂದಿನ ಕ್ಲೇಮ್‌ಗಳನ್ನು ವೀಕ್ಷಿಸಿ (View Existing Claims)'
                    : 'View My Existing Claim Dossiers'}
                </span>
              </button>
              <div className="text-[11px] text-slate-400 text-center font-mono font-medium">
                {language === 'kn' ? 'ಐತಿಹಾಸಿಕ ಉಪಗ್ರಹ ಸಾಕ್ಷ್ಯ ಸಕ್ರಿಯ' : 'Historical satellite evidence active'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* VOICE GUIDANCE ASSISTANT BANNER                                */}
      {/* ============================================================== */}
      <div className="bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-950/50 shrink-0">
            <span className="text-2xl">🌾</span>
            {isSpeaking && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500 border-2 border-slate-900"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                {language === 'kn' ? 'ಧ್ವನಿ ಮಾರ್ಗದರ್ಶನ ಸಹಾಯಕ' : 'Voice Guidance Assistant'}
              </span>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                isSpeaking 
                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-700 animate-pulse'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700'
              }`}>
                {isSpeaking ? (language === 'kn' ? 'ಮಾತನಾಡುತ್ತಿದೆ (Speaking)' : 'Speaking...') : (language === 'kn' ? 'ಸಿದ್ಧವಾಗಿದೆ (Ready)' : 'Ready')}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 max-w-xl font-medium">
              {verifiedLand 
                ? (language === 'kn' ? verifiedPromptKn : verifiedPromptEn)
                : (language === 'kn' ? introPromptKn : introPromptEn)
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          <button
            type="button"
            onClick={toggleSpeak}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-md ${
              isSpeaking
                ? 'bg-cyan-950 text-cyan-300 border-2 border-cyan-500 animate-pulse'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white'
            }`}
            title={isSpeaking ? 'Click to Stop Speaking' : 'Click to Listen to Guidance'}
          >
            {isSpeaking ? (
              <>
                <div className="flex items-center gap-0.5 h-3">
                  <span className="w-1 h-3 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1 h-4 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1 h-2 bg-cyan-400 rounded-full animate-bounce"></span>
                </div>
                <span>{language === 'kn' ? 'ನಿಲ್ಲಿಸಿ (Stop)' : 'Stop Speaking'}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span>{language === 'kn' ? 'ಮಾರ್ಗದರ್ಶನ ಕೇಳಿ (Listen)' : 'Listen to Guidance'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              if (isSpeaking) stopSpeaking();
              setVoiceEnabled(!voiceEnabled);
            }}
            className={`p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
              voiceEnabled
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                : 'bg-red-950/60 text-red-400 border-red-800/60'
            }`}
            title={voiceEnabled ? 'Mute Voice' : 'Unmute Voice'}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. TWO PROMINENT OPTIONS IN SEPARATE CARDS                     */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* OPTION 1: I KNOW MY ULPIN CARD */}
        <div className="relative rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 p-6 md:p-8 flex flex-col justify-between shadow-xl backdrop-blur-xl transition-all duration-300 group">
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/70 text-cyan-300 text-[11px] font-extrabold uppercase tracking-wider border border-cyan-800/60">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> {language === 'kn' ? 'ಆಯ್ಕೆ 1 (Option 1)' : 'Option 1'}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-cyan-950/60 rounded-2xl text-cyan-400 border border-cyan-800/60">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white group-hover:text-cyan-300 transition-colors">
                  {language === 'kn' ? 'ನನ್ನ ULPIN ತಿಳಿದಿದೆ (I Know My ULPIN)' : 'I Know My ULPIN / ನನ್ನ ULPIN ತಿಳಿದಿದೆ'}
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  {language === 'kn' ? 'ನೇರ ಭೂ-ಆಧಾರ್ ನಮೂದು (Direct Cadastral Input)' : 'Direct Cadastral Input'}
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              {language === 'kn'
                ? 'ಬೆಳೆ ಹಾನಿ ಮೌಲ್ಯಮಾಪನ ಮುಂದುವರಿಸಲು ನಿಮ್ಮ ಜಮೀನಿನ 14-ಅಂಕಿಯ ULPIN ನಮೂದಿಸಿ. ನಾವು ಇದನ್ನು ರಾಷ್ಟ್ರೀಯ ಭೂ ದಾಖಲೆಗಳಲ್ಲಿ ತಕ್ಷಣ ಪರಿಶೀಲಿಸುತ್ತೇವೆ.'
                : "Enter your land's ULPIN to continue with crop damage assessment. We will instantly verify it against the National Cadastral Registry."}
            </p>

            {/* Input Form */}
            <form onSubmit={handleValidate} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="ulpin-input-field" className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>
                      {language === 'kn'
                        ? '14-ಅಕ್ಷರಗಳ ULPIN ಭೂ-ಆಧಾರ್ (14-Character ULPIN)'
                        : '14-Character ULPIN (Bhu-Aadhaar)'}
                    </span>
                    <span className="text-cyan-400">*</span>
                  </label>
                  <span className={`text-[11px] font-mono ${isFormatValid ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
                    {cleanInput.length}/14 {language === 'kn' ? 'ಅಕ್ಷರಗಳು' : 'Characters'}
                  </span>
                </div>

                <div className="relative flex items-center">
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
                    className="w-full bg-slate-950/70 border border-slate-800 focus:bg-slate-900 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 rounded-xl pl-4 pr-24 py-3 text-white font-mono text-base tracking-widest placeholder:text-slate-600 transition outline-none"
                  />
                  <div className="absolute right-2 flex items-center gap-1.5">
                    {/* Microphone Speech to Text Button */}
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={`p-2 rounded-lg transition cursor-pointer flex items-center gap-1 text-xs font-bold ${
                        isListening
                          ? 'bg-red-600 text-white animate-pulse shadow-md ring-2 ring-red-400'
                          : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700'
                      }`}
                      title={isListening ? 'Click to stop listening' : 'Click to speak ULPIN'}
                    >
                      {isListening ? (
                        <>
                          <MicOff className="w-4 h-4 text-white" />
                          <span className="hidden sm:inline text-[11px] font-mono">Listening...</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4 text-cyan-400" />
                          <span className="hidden sm:inline text-[11px]">Speak</span>
                        </>
                      )}
                    </button>

                    {isFormatValid && (
                      <div className="p-1 bg-cyan-950 text-cyan-400 rounded-lg border border-cyan-800">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Real-time Voice Transcript / Parsing feedback */}
                {(isListening || spokenTranscript || lastParsedSummary) && (
                  <div className="mt-2 p-2.5 bg-slate-950/80 border border-cyan-900/60 rounded-xl text-xs flex items-center justify-between gap-2 animate-fadeIn">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
                      <span className="text-slate-300 truncate font-medium">
                        {isListening 
                          ? (spokenTranscript ? `🎙️ "${spokenTranscript}"` : (language === 'kn' ? '🎙️ ಕೇಳಿಸಿಕೊಳ್ಳಲಾಗುತ್ತಿದೆ... ನಿಮ್ಮ 14-ಅಂಕಿಯ ULPIN ಮಾತನಾಡಿ...' : '🎙️ Listening... Speak your 14-character ULPIN...'))
                          : (lastParsedSummary || `Spoken: "${spokenTranscript}"`)
                        }
                      </span>
                    </div>
                    {isListening && (
                      <button
                        type="button"
                        onClick={toggleListening}
                        className="text-[10px] text-red-400 font-bold hover:underline shrink-0"
                      >
                        {language === 'kn' ? 'ಮುಗಿಸಿ' : 'Done'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Demo Pre-fill Chips for quick testing */}
              <div className="pt-1">
                <div className="text-[11px] text-slate-400 mb-1.5 font-semibold flex items-center justify-between">
                  <span>⚡ {language === 'kn' ? 'ಧ್ವನಿ ಮಾದರಿ ಅಥವಾ ಡೆಮೊ ಜಮೀನುಗಳು (Quick Voice & Demo):' : 'Quick Voice & Demo Parcels:'}</span>
                  <span className="text-[10px] text-cyan-400 font-mono">1-Click Voice Fill</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickVoiceAnswer('29BLR125200102 Ravi Kumar Survey 125/2', '29BLR125200102')}
                    className="px-2.5 py-1 bg-slate-850 hover:bg-slate-800 text-cyan-300 text-xs font-mono rounded-lg border border-slate-700/80 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Mic className="w-3 h-3 text-cyan-400" />
                    <span>29BLR125200102 (Ravi - Survey 125/2)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickVoiceAnswer('29BEL048100108 Suresh Gowda Survey 48/1A', '29BEL048100108')}
                    className="px-2.5 py-1 bg-slate-850 hover:bg-slate-800 text-cyan-300 text-xs font-mono rounded-lg border border-slate-700/80 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Mic className="w-3 h-3 text-cyan-400" />
                    <span>29BEL048100108 (Suresh - 48/1A)</span>
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3.5 bg-red-950/50 border border-red-800/80 rounded-xl text-red-300 text-xs flex items-start gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Continue / Validate Button */}
              {!verifiedLand && (
                <button
                  type="submit"
                  disabled={isValidating || !cleanInput}
                  className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm tracking-wide shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2 transition cursor-pointer"
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
            <div className="mt-6 pt-5 border-t border-slate-800 animate-fadeIn">
              <div className="bg-slate-950/90 border border-cyan-500/40 rounded-2xl p-4 sm:p-5 shadow-inner">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                    <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                      {language === 'kn'
                        ? 'ಜಮೀನಿನ ವಿವರಗಳು ದೃಢೀಕರಿಸಲ್ಪಟ್ಟಿವೆ (Land Details Confirmed)'
                        : 'Land Details Confirmed'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {language === 'kn' ? 'ದೃಢೀಕೃತ (VERIFIED)' : 'VERIFIED'}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      {language === 'kn' ? 'ಜಮೀನು ಮಾಲೀಕರು (Land Owner)' : 'Land Owner'}
                    </span>
                    <strong className="text-white text-sm">{verifiedLand.farmer_name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      {language === 'kn' ? 'ಸರ್ವೆ ಸಂಖ್ಯೆ (Survey #)' : 'Survey Number'}
                    </span>
                    <strong className="text-cyan-300 font-mono text-sm">#{verifiedLand.survey_number}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      {language === 'kn' ? 'ಸ್ಥಳ (Location)' : 'Location'}
                    </span>
                    <span className="text-slate-300 font-medium">{verifiedLand.village}, {verifiedLand.taluk}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      {language === 'kn' ? 'ಜಿಲ್ಲೆ ಮತ್ತು ರಾಜ್ಯ' : 'District & State'}
                    </span>
                    <span className="text-slate-300 font-medium">{verifiedLand.district}, {verifiedLand.state}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      {language === 'kn' ? 'ವಿಸ್ತೀರ್ಣ (Area)' : 'Area'}
                    </span>
                    <strong className="text-white">{verifiedLand.area_acres} {language === 'kn' ? 'ಎಕರೆ (Acres)' : 'Acres'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      {language === 'kn' ? 'ಡಿಜಿಪಿನ್ ಕೋಡ್ (DIGIPIN)' : 'DIGIPIN Code'}
                    </span>
                    <strong className="text-cyan-300 font-mono">{verifiedLand.digipin}</strong>
                  </div>
                </div>

                {/* Cadastral & GPS Badge */}
                <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-cyan-400 font-mono font-medium">
                  <span>📍 GPS: {verifiedLand.latitude.toFixed(4)}°N, {verifiedLand.longitude.toFixed(4)}°E</span>
                  <span>🛰️ Sentinel-2 Active</span>
                </div>

                {/* Proceed Button */}
                <button
                  type="button"
                  onClick={() => onProceedToAssessment(verifiedLand)}
                  className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/50 transition cursor-pointer"
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
        <div className="relative rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 p-6 md:p-8 flex flex-col justify-between shadow-xl backdrop-blur-xl transition-all duration-300 group">
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/70 text-amber-300 text-[11px] font-extrabold uppercase tracking-wider border border-amber-800/60">
              <Search className="w-3.5 h-3.5 text-amber-400" /> {language === 'kn' ? 'ಆಯ್ಕೆ 2 (Option 2)' : 'Option 2'}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-amber-950/60 rounded-2xl text-amber-400 border border-amber-800/60">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white group-hover:text-amber-300 transition-colors">
                  {language === 'kn' ? 'ULPIN ಮರೆತಿದೆ (Forgot My ULPIN)' : 'Forgot My ULPIN / ULPIN ಮರೆತಿದೆ'}
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  {language === 'kn' ? 'ಭೂಮಿ ದಾಖಲೆಗಳಿಂದ ಮರುಪಡೆಯಿರಿ (Bhoomi Recovery)' : 'Bhoomi Cadastral Recovery'}
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              {language === 'kn'
                ? 'ನಿಮ್ಮ ಜಮೀನಿನ ULPIN ತಿಳಿದಿಲ್ಲವೇ? ನಿಮ್ಮ ಹೆಸರು, ಜಿಲ್ಲೆ, ತಾಲೂಕು, ಗ್ರಾಮ ಮತ್ತು ಸರ್ವೆ ಸಂಖ್ಯೆಯನ್ನು ಬಳಸಿ ಕರ್ನಾಟಕ ಭೂಮಿ ಪೋರ್ಟಲ್‌ನಿಂದ ತಕ್ಷಣ ಮರುಪಡೆಯಿರಿ.'
                : "Don't know your ULPIN? Retrieve it using your land details. Search by your name, district, taluk, village, and survey number."}
            </p>

            {/* Feature highlights */}
            <div className="space-y-3 mb-8 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-3 text-xs text-slate-300 font-medium">
                <div className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold text-[10px]">
                  ✓
                </div>
                <span>
                  {language === 'kn'
                    ? 'ಕರ್ನಾಟಕ ಭೂಮಿ ದಾಖಲೆಗಳಿಂದ ತ್ವರಿತ ಶೋಧ (Instant retrieval from Bhoomi records)'
                    : 'Instant retrieval from State Land & Bhoomi records'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300 font-medium">
                <div className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold text-[10px]">
                  ✓
                </div>
                <span>
                  {language === 'kn'
                    ? 'ಪಹಣಿ ಅಥವಾ ಭೌತಿಕ ದಾಖಲೆಗಳ ಅಪ್‌ಲೋಡ್ ಅಗತ್ಯವಿಲ್ಲ (No physical document upload needed)'
                    : 'No physical document upload or land passbook needed'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300 font-medium">
                <div className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold text-[10px]">
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
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-sm tracking-wide shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2 transition cursor-pointer"
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
