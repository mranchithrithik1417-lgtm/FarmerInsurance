import React, { useState, useEffect, useRef } from 'react';
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
  ShieldCheck,
  Mic,
  MicOff,
  Volume2,
  VolumeX
} from 'lucide-react';
import { OfficialLandRecord } from '../../types';
import { retrieveULPIN } from '../../services/api';
import { b, t } from '../../utils/translations';
import {
  speakAloud,
  stopSpeaking,
  primeSpeechSynthesis,
  playChime,
  parseSpokenSurveyNumber,
  parseSpokenTextValue
} from '../../utils/speech';

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

  // Voice Guidance & Speech Recognition State
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [listeningField, setListeningField] = useState<'all' | 'fullName' | 'district' | 'taluk' | 'village' | 'surveyNumber' | null>(null);
  const [spokenTranscript, setSpokenTranscript] = useState<string>('');
  const [lastParsedSummary, setLastParsedSummary] = useState<string>('');
  const recognitionRef = useRef<any>(null);

  const forgotIntroPromptEn = "Search for your land parcel. Speak or enter your full name, district, taluk, village, and survey number, then click Fetch ULPIN.";
  const forgotIntroPromptKn = "ಭೂಮಿ ದಾಖಲೆಗಳಿಂದ ನಿಮ್ಮ ULPIN ಮರುಪಡೆಯಿರಿ. ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು, ಜಿಲ್ಲೆ, ತಾಲೂಕು, ಗ್ರಾಮ ಮತ್ತು ಸರ್ವೆ ಸಂಖ್ಯೆಯನ್ನು ಮಾತನಾಡಿ ಅಥವಾ ನಮೂದಿಸಿ, ನಂತರ ಹುಡುಕಿ ಕ್ಲಿಕ್ ಮಾಡಿ.";

  const resultsPromptEn = matchedRecords.length > 0
    ? `Found ${matchedRecords.length} matching land record${matchedRecords.length > 1 ? 's' : ''}. Select your land parcel and click Confirm to start your Crop Loss Assessment.`
    : "No land records found. Please check your details or spelling.";
  const resultsPromptKn = "ಹೊಂದಿಕೆಯಾಗುವ ಭೂ ದಾಖಲೆಗಳು ಕಂಡುಬಂದಿವೆ. ನಿಮ್ಮ ಜಮೀನನ್ನು ಆಯ್ಕೆಮಾಡಿ ಮತ್ತು ಬೆಳೆ ಹಾನಿ ಮೌಲ್ಯಮಾಪನಕ್ಕೆ ತೆರಳಲು ದೃಢೀಕರಿಸಿ ಕ್ಲಿಕ್ ಮಾಡಿ.";

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
      const prompt = matchedRecords.length > 0
        ? (language === 'kn' ? resultsPromptKn : resultsPromptEn)
        : (language === 'kn' ? forgotIntroPromptKn : forgotIntroPromptEn);
      speakGuidance(prompt);
    }
  };

  // Auto-speak on view mount or search results
  useEffect(() => {
    if (voiceEnabled) {
      const prompt = matchedRecords.length > 0
        ? (language === 'kn' ? resultsPromptKn : resultsPromptEn)
        : (language === 'kn' ? forgotIntroPromptKn : forgotIntroPromptEn);
      const timer = setTimeout(() => {
        speakGuidance(prompt);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [voiceEnabled, language, matchedRecords.length]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (recognitionRef.current?.stop) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  // Speech-to-Text field listener
  const startFieldListening = (field: 'all' | 'fullName' | 'district' | 'taluk' | 'village' | 'surveyNumber') => {
    primeSpeechSynthesis();
    if (listeningField === field) {
      if (recognitionRef.current?.stop) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setListeningField(null);
      return;
    }

    if (recognitionRef.current?.stop) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setErrorMsg(language === 'kn'
        ? 'ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ. ದಯವಿಟ್ಟು ತ್ವರಿತ ಆಯ್ಕೆಗಳನ್ನು ಬಳಸಿ.'
        : 'Speech recognition is not supported in this browser. Please use quick sample presets.');
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'kn' ? 'kn-IN' : 'en-IN';

      recognition.onstart = () => {
        setListeningField(field);
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

        if (field === 'fullName') {
          const parsed = parseSpokenTextValue(transcript, 'name');
          if (parsed) {
            setFullName(parsed);
            setLastParsedSummary(`✓ Name: ${parsed}`);
          }
        } else if (field === 'district') {
          const parsed = parseSpokenTextValue(transcript, 'district');
          if (parsed) {
            setDistrict(parsed);
            setLastParsedSummary(`✓ District: ${parsed}`);
          }
        } else if (field === 'taluk') {
          const parsed = parseSpokenTextValue(transcript, 'taluk');
          if (parsed) {
            setTaluk(parsed);
            setLastParsedSummary(`✓ Taluk: ${parsed}`);
          }
        } else if (field === 'village') {
          const parsed = parseSpokenTextValue(transcript, 'village');
          if (parsed) {
            setVillage(parsed);
            setLastParsedSummary(`✓ Village: ${parsed}`);
          }
        } else if (field === 'surveyNumber') {
          const parsed = parseSpokenSurveyNumber(transcript);
          if (parsed) {
            setSurveyNumber(parsed);
            setLastParsedSummary(`✓ Survey #${parsed}`);
          }
        } else if (field === 'all') {
          const lower = transcript.toLowerCase();
          if (lower.includes('ravi') || lower.includes('125')) {
            loadPreset({ fn: 'Ravi Kumar', dist: 'Bengaluru Rural', tal: 'Devanahalli', vill: 'Devanahalli', surv: '125/2' });
            setLastParsedSummary('✓ Understood: Ravi Kumar • Devanahalli • Survey 125/2');
          } else if (lower.includes('suresh') || lower.includes('48')) {
            loadPreset({ fn: 'Suresh Gowda', dist: 'Belagavi', tal: 'Bailhongal', vill: 'Sampgaon', surv: '48/1A' });
            setLastParsedSummary('✓ Understood: Suresh Gowda • Bailhongal • Survey 48/1A');
          } else if (lower.includes('mallikarjun') || lower.includes('88')) {
            loadPreset({ fn: 'Mallikarjun Patil', dist: 'Dharwad', tal: 'Hubballi', vill: 'Amargol', surv: '88/3' });
            setLastParsedSummary('✓ Understood: Mallikarjun Patil • Hubballi • Survey 88/3');
          } else {
            const survMatch = transcript.match(/(?:survey\s*(?:no\.?|number|#)?|ಸರ್ವೆ\s*(?:ಸಂಖ್ಯೆ|ನಂ)?)\s*([0-9]{1,4}\s*(?:\/|by|ಬೈ)\s*[0-9a-zA-Z]{1,4})/i);
            if (survMatch) {
              setSurveyNumber(survMatch[1].replace(/\s*(?:by|ಬೈ)\s*/i, '/'));
            }
            setLastParsedSummary(`✓ Captured: "${transcript.slice(0, 40)}..."`);
          }
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech error:', e);
        setListeningField(null);
      };

      recognition.onend = () => {
        setListeningField(null);
        playChime('success');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Recognition start error:', err);
      setListeningField(null);
    }
  };

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
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <button
          type="button"
          onClick={onBackToDashboard}
          className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 hover:text-white rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-700 shadow-md transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          <span>{b('Back to Land Identification', 'ಭೂಮಿ ಗುರುತಿಸುವಿಕೆಗೆ ಹಿಂತಿರುಗಿ', language)}</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800/60">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>{b('Official Cadastral Recovery Gateway', 'ಅಧಿಕೃತ ಭೂ ಕಂದಾಯ ಮರುಪಡೆಯುವಿಕೆ ಗೇಟ್‌ವೇ', language)}</span>
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
              {matchedRecords.length > 0 
                ? (language === 'kn' ? resultsPromptKn : resultsPromptEn)
                : (language === 'kn' ? forgotIntroPromptKn : forgotIntroPromptEn)
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

      {/* Main Titles */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <span className="p-2.5 bg-cyan-950/60 text-cyan-400 rounded-2xl border border-cyan-800/60 text-xl shadow-md">
            🔍
          </span>
          <span>{b('Recover Your ULPIN', 'ನಿಮ್ಮ ULPIN ಮರುಪಡೆಯಿರಿ', language)}</span>
        </h1>
        <p className="text-sm text-slate-300 mt-1">
          {b(
            'Enter your personal and agricultural land details to retrieve your ULPIN from official Bhoomi and State Land Records.',
            'ಅಧಿಕೃತ ಭೂಮಿ ಮತ್ತು ರಾಜ್ಯ ಭೂ ದಾಖಲೆಗಳಿಂದ ನಿಮ್ಮ ULPIN ಪಡೆಯಲು ವೈಯಕ್ತಿಕ ಮತ್ತು ಕೃಷಿ ಭೂಮಿಯ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ.',
            language
          )}
        </p>
      </div>

      {/* Demo Presets Bar with Voice Fill */}
      <div className="p-3.5 bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-300 font-semibold flex items-center gap-1.5 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>{b('Quick Presets & Voice:', 'ತ್ವರಿತ ಮಾದರಿ & ಧ್ವನಿ:', language)}</span>
          </span>
          <button
            type="button"
            onClick={() => loadPreset({ fn: 'Ravi Kumar', dist: 'Bengaluru Rural', tal: 'Devanahalli', vill: 'Devanahalli', surv: '125/2' })}
            className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-750 text-cyan-300 text-xs font-mono rounded-lg border border-slate-700/80 transition cursor-pointer flex items-center gap-1"
          >
            <Mic className="w-3 h-3 text-cyan-400" />
            <span>{b('Ravi Kumar (125/2)', 'ರವಿ ಕುಮಾರ್ (125/2)', language)}</span>
          </button>
          <button
            type="button"
            onClick={() => loadPreset({ fn: 'Suresh Gowda', dist: 'Belagavi', tal: 'Bailhongal', vill: 'Sampgaon', surv: '48/1A' })}
            className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-750 text-cyan-300 text-xs font-mono rounded-lg border border-slate-700/80 transition cursor-pointer flex items-center gap-1"
          >
            <Mic className="w-3 h-3 text-cyan-400" />
            <span>{b('Suresh Gowda (48/1A)', 'ಸುರೇಶ್ ಗೌಡ (48/1A)', language)}</span>
          </button>
        </div>

        {/* Global Speak All Details Button */}
        <button
          type="button"
          onClick={() => startFieldListening('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md ${
            listeningField === 'all'
              ? 'bg-red-600 text-white animate-pulse ring-2 ring-red-400'
              : 'bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-cyan-800/60'
          }`}
          title="Speak all details at once"
        >
          {listeningField === 'all' ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-cyan-400" />}
          <span>
            {listeningField === 'all' 
              ? (language === 'kn' ? 'ಕೇಳಿಸಿಕೊಳ್ಳಲಾಗುತ್ತಿದೆ...' : 'Listening...')
              : (language === 'kn' ? 'ಧ್ವನಿ ಮೂಲಕ ಎಲ್ಲವನ್ನೂ ಹೇಳಿ' : 'Speak All Details')}
          </span>
        </button>
      </div>

      {/* Real-time Voice Transcript / Parsing feedback */}
      {(listeningField || spokenTranscript || lastParsedSummary) && (
        <div className="p-3 bg-slate-950/80 border border-cyan-900/60 rounded-2xl text-xs flex items-center justify-between gap-2 animate-fadeIn shadow-md">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping shrink-0" />
            <span className="text-slate-300 truncate font-medium">
              {listeningField
                ? (spokenTranscript 
                    ? `🎙️ "${spokenTranscript}"` 
                    : (language === 'kn' 
                        ? `🎙️ ಕೇಳಿಸಿಕೊಳ್ಳಲಾಗುತ್ತಿದೆ... ${listeningField === 'all' ? 'ಎಲ್ಲಾ ವಿವರಗಳನ್ನು' : listeningField} ಮಾತನಾಡಿ...` 
                        : `🎙️ Listening... Speak ${listeningField === 'all' ? 'all details' : listeningField}...`))
                : (lastParsedSummary || `Spoken: "${spokenTranscript}"`)
              }
            </span>
          </div>
          {listeningField && (
            <button
              type="button"
              onClick={() => {
                if (recognitionRef.current?.stop) {
                  try { recognitionRef.current.stop(); } catch (e) {}
                }
                setListeningField(null);
              }}
              className="text-xs text-red-400 font-bold hover:underline shrink-0"
            >
              {language === 'kn' ? 'ಮುಗಿಸಿ' : 'Stop'}
            </button>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. RECOVERY FORM CARD                                          */}
      {/* ============================================================== */}
      <div className="bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <form onSubmit={handleFetchULPIN} className="space-y-5">
          {/* Row 1: Full Name (Mandatory) */}
          <div>
            <label htmlFor="recovery-full-name" className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>{b('1. Full Name (As per Land Records)', '1. ಪೂರ್ಣ ಹೆಸರು (ಭೂ ದಾಖಲೆಗಳ ಪ್ರಕಾರ)', language)}</span>
              </span>
              <span className="text-[10px] text-cyan-300 font-mono font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                {b('MANDATORY *', 'ಕಡ್ಡಾಯ *', language)}
              </span>
            </label>
            <div className="relative flex items-center">
              <input
                id="recovery-full-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={b('e.g. Ravi Kumar', 'ಉದಾ: ರವಿ ಕುಮಾರ್', language)}
                className="w-full bg-slate-950/70 border border-slate-800 focus:bg-slate-900 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 rounded-xl pl-4 pr-12 py-2.5 sm:py-3 text-white text-sm transition outline-none placeholder:text-slate-600"
              />
              <button
                type="button"
                onClick={() => startFieldListening('fullName')}
                className={`absolute right-2 p-1.5 rounded-lg transition cursor-pointer ${
                  listeningField === 'fullName'
                    ? 'bg-red-600 text-white animate-pulse ring-2 ring-red-400'
                    : 'bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-slate-700'
                }`}
                title={listeningField === 'fullName' ? 'Stop listening' : 'Speak Full Name'}
              >
                {listeningField === 'fullName' ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Row 2: District & Taluk (Mandatory) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="recovery-district" className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{b('2. District', '2. ಜಿಲ್ಲೆ', language)}</span>
                </span>
                <span className="text-[10px] text-cyan-300 font-mono font-bold">{b('MANDATORY *', 'ಕಡ್ಡಾಯ *', language)}</span>
              </label>
              <div className="relative flex items-center">
                <input
                  id="recovery-district"
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder={b('e.g. Bengaluru Rural', 'ಉದಾ: ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ', language)}
                  className="w-full bg-slate-950/70 border border-slate-800 focus:bg-slate-900 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 rounded-xl pl-4 pr-12 py-2.5 sm:py-3 text-white text-sm transition outline-none placeholder:text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => startFieldListening('district')}
                  className={`absolute right-2 p-1.5 rounded-lg transition cursor-pointer ${
                    listeningField === 'district'
                      ? 'bg-red-600 text-white animate-pulse ring-2 ring-red-400'
                      : 'bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-slate-700'
                  }`}
                  title={listeningField === 'district' ? 'Stop listening' : 'Speak District'}
                >
                  {listeningField === 'district' ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="recovery-taluk" className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{b('3. Taluk', '3. ತಾಲೂಕು', language)}</span>
                </span>
                <span className="text-[10px] text-cyan-300 font-mono font-bold">{b('MANDATORY *', 'ಕಡ್ಡಾಯ *', language)}</span>
              </label>
              <div className="relative flex items-center">
                <input
                  id="recovery-taluk"
                  type="text"
                  required
                  value={taluk}
                  onChange={(e) => setTaluk(e.target.value)}
                  placeholder={b('e.g. Devanahalli', 'ಉದಾ: ದೇವನಹಳ್ಳಿ', language)}
                  className="w-full bg-slate-950/70 border border-slate-800 focus:bg-slate-900 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 rounded-xl pl-4 pr-12 py-2.5 sm:py-3 text-white text-sm transition outline-none placeholder:text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => startFieldListening('taluk')}
                  className={`absolute right-2 p-1.5 rounded-lg transition cursor-pointer ${
                    listeningField === 'taluk'
                      ? 'bg-red-600 text-white animate-pulse ring-2 ring-red-400'
                      : 'bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-slate-700'
                  }`}
                  title={listeningField === 'taluk' ? 'Stop listening' : 'Speak Taluk'}
                >
                  {listeningField === 'taluk' ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Row 3: Village (Mandatory) & Survey Number (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="recovery-village" className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{b('4. Village', '4. ಗ್ರಾಮ / ಹಳ್ಳಿ', language)}</span>
                </span>
                <span className="text-[10px] text-cyan-300 font-mono font-bold">{b('MANDATORY *', 'ಕಡ್ಡಾಯ *', language)}</span>
              </label>
              <div className="relative flex items-center">
                <input
                  id="recovery-village"
                  type="text"
                  required
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder={b('e.g. Devanahalli', 'ಉದಾ: ದೇವನಹಳ್ಳಿ', language)}
                  className="w-full bg-slate-950/70 border border-slate-800 focus:bg-slate-900 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 rounded-xl pl-4 pr-12 py-2.5 sm:py-3 text-white text-sm transition outline-none placeholder:text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => startFieldListening('village')}
                  className={`absolute right-2 p-1.5 rounded-lg transition cursor-pointer ${
                    listeningField === 'village'
                      ? 'bg-red-600 text-white animate-pulse ring-2 ring-red-400'
                      : 'bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-slate-700'
                  }`}
                  title={listeningField === 'village' ? 'Stop listening' : 'Speak Village'}
                >
                  {listeningField === 'village' ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="recovery-survey" className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-slate-500" />
                  <span>{b('5. Survey Number', '5. ಸರ್ವೆ ಸಂಖ್ಯೆ', language)}</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{b('OPTIONAL', 'ಐಚ್ಛಿಕ', language)}</span>
              </label>
              <div className="relative flex items-center">
                <input
                  id="recovery-survey"
                  type="text"
                  value={surveyNumber}
                  onChange={(e) => setSurveyNumber(e.target.value)}
                  placeholder={b('e.g. 125/2 (leave blank to see all plots)', 'ಉದಾ: 125/2 (ಎಲ್ಲಾ ಜಮೀನು ನೋಡಲು ಖಾಲಿ ಬಿಡಿ)', language)}
                  className="w-full bg-slate-950/70 border border-slate-800 focus:bg-slate-900 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 rounded-xl pl-4 pr-12 py-2.5 sm:py-3 text-white text-sm transition outline-none placeholder:text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => startFieldListening('surveyNumber')}
                  className={`absolute right-2 p-1.5 rounded-lg transition cursor-pointer ${
                    listeningField === 'surveyNumber'
                      ? 'bg-red-600 text-white animate-pulse ring-2 ring-red-400'
                      : 'bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-slate-700'
                  }`}
                  title={listeningField === 'surveyNumber' ? 'Stop listening' : 'Speak Survey Number'}
                >
                  {listeningField === 'surveyNumber' ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="p-4 bg-red-950/50 border border-red-800/80 rounded-xl text-red-300 text-xs flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <div>
                <strong>{errorMsg}</strong>
                <p className="text-[11px] text-red-400/90 mt-0.5">
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
              className="w-full sm:flex-1 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm tracking-wide shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2 transition cursor-pointer"
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
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer border border-slate-700"
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
        <div className="bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-xl space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="p-1.5 bg-cyan-950/60 text-cyan-400 rounded-lg border border-cyan-800/60">📋</span>
                <span>
                  {b(
                    `Multiple Land Records Found (${matchedRecords.length} Parcels)`,
                    `ಹಲವಾರು ಭೂ ದಾಖಲೆಗಳು ಕಂಡುಬಂದಿವೆ (${matchedRecords.length} ಜಮೀನುಗಳು)`,
                    language
                  )}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {b(
                  `We found ${matchedRecords.length} agricultural land parcels registered under `,
                  `${village} ಗ್ರಾಮದಲ್ಲಿ `,
                  language
                )}
                <strong className="text-slate-200">{fullName}</strong>
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
                      ? 'bg-slate-950/90 border-cyan-500 shadow-lg shadow-cyan-950/50 scale-[1.01]'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800/60">
                        {b('Survey #', 'ಸರ್ವೆ ಸಂಖ್ಯೆ #', language)}{rec.survey_number}
                      </span>
                      <span className="text-xs font-bold text-slate-300">
                        {rec.area_acres} {b('Acres', 'ಎಕರೆ', language)}
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
                      {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">DIGIPIN: {rec.digipin}</span>
                    <span className={`font-bold ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`}>
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
        <div className="bg-slate-900/90 border-2 border-cyan-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6 animate-fadeIn">
          {/* Header Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-tr from-cyan-600 to-blue-600 text-white rounded-2xl shadow-md shadow-cyan-950/50">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/70 text-cyan-300 text-[10px] font-extrabold uppercase tracking-wider border border-cyan-800/60 mb-1">
                  {b('National Bhoomi Cadastral Match', 'ರಾಷ್ಟ್ರೀಯ ಭೂಮಿ ದಾಖಲೆ ಹೊಂದಾಣಿಕೆ', language)}
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  {b('ULPIN Retrieved Successfully!', 'ULPIN ಯಶಸ್ವಿಯಾಗಿ ದೊರೆತಿದೆ!', language)}
                </h2>
              </div>
            </div>

            <div className="text-left sm:text-right font-mono text-xs text-cyan-300 bg-cyan-950/60 px-3 py-1.5 rounded-xl border border-cyan-800/60 font-bold">
              {b('Verified & Co-Registered', 'ಪರಿಶೀಲಿಸಲಾಗಿದೆ & ನೋಂದಾಯಿಸಲಾಗಿದೆ', language)}
            </div>
          </div>

          {/* Highlighted ULPIN Display Box */}
          <div className="p-5 rounded-2xl bg-slate-950/90 border border-cyan-500/40 shadow-inner flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block mb-1">
                {b('Unique Land Parcel Identification Number (Bhu-Aadhaar)', 'ವಿಶಿಷ್ಟ ಭೂಮಿ ಗುರುತಿನ ಸಂಖ್ಯೆ (ಭೂ-ಆಧಾರ್)', language)}
              </span>
              <div className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-cyan-300">
                {selectedRecord.ulpin}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleCopy(selectedRecord.ulpin)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition cursor-pointer shrink-0"
            >
              {copiedULPIN ? (
                <>
                  <Check className="w-4 h-4 text-cyan-400" />
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                {b("Farmer's Full Name", 'ರೈತರ ಪೂರ್ಣ ಹೆಸರು', language)}
              </span>
              <strong className="text-white text-sm">{selectedRecord.farmer_name}</strong>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                {b('Survey Number', 'ಸರ್ವೆ ಸಂಖ್ಯೆ', language)}
              </span>
              <strong className="text-cyan-300 font-mono text-sm">#{selectedRecord.survey_number}</strong>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                {b('Village', 'ಗ್ರಾಮ / ಊರು', language)}
              </span>
              <strong className="text-slate-200">{selectedRecord.village}</strong>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                {b('Taluk & District', 'ತಾಲೂಕು & ಜಿಲ್ಲೆ', language)}
              </span>
              <span className="text-slate-300 font-medium">{selectedRecord.taluk}, {selectedRecord.district}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                {b('Registered Area', 'ನೋಂದಾಯಿತ ವಿಸ್ತೀರ್ಣ', language)}
              </span>
              <strong className="text-white">{selectedRecord.area_acres} {b('Acres', 'ಎಕರೆ', language)}</strong>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                {b('National DIGIPIN', 'ರಾಷ್ಟ್ರೀಯ ಡಿಜಿಪಿನ್', language)}
              </span>
              <strong className="text-cyan-300 font-mono">{selectedRecord.digipin}</strong>
            </div>

            <div className="col-span-2">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                {b('GPS Centroid Coordinates', 'ಜಿಪಿಎಸ್ ನಿರ್ದೇಶಾಂಕಗಳು', language)}
              </span>
              <span className="text-cyan-400 font-mono">
                {selectedRecord.latitude.toFixed(5)}° N, {selectedRecord.longitude.toFixed(5)}° E
              </span>
            </div>
          </div>

          {/* Action Buttons: Continue to Crop Assessment / Back */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onContinueToAssessment(selectedRecord)}
              className="w-full sm:flex-1 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/50 transition cursor-pointer"
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
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer border border-slate-700"
            >
              {b('Back', 'ಹಿಂದೆ', language)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
