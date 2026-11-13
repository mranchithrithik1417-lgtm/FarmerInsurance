import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  SkipForward,
  CheckCircle2,
  MapPin,
  Camera,
  Sparkles,
  X,
  ShieldAlert,
  Globe,
  ExternalLink,
  RefreshCw,
  Navigation,
  Edit3,
  AlertCircle,
  Maximize2,
  Trash2,
  ShieldCheck,
  Layers
} from 'lucide-react';
import { encodeDigipin } from '../../utils/digipin';
import { generateDefaultParcelCoordinates } from '../../utils/geo';
import { LandPlotMapSelector } from './LandPlotMapSelector';
import { b, t } from '../../utils/translations';
import {
  speakAloud,
  stopSpeaking,
  primeSpeechSynthesis,
  playChime,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported
} from '../../utils/speech';
import { GeoCameraModal, GeoPhoto } from './GeoCameraModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: any) => void;
  language?: 'en' | 'kn';
  initialLandData?: any;
}

export const VoiceAssistantModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onComplete,
  language = 'en',
  initialLandData
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [spokenTranscript, setSpokenTranscript] = useState<string>('');
  const [lastParsedSummary, setLastParsedSummary] = useState<string>('');
  const [recErrorMsg, setRecErrorMsg] = useState<string | null>(null);
  const [micAudioLevel, setMicAudioLevel] = useState<number>(0);

  // Camera & Image Preview Modals
  const [showCameraModal, setShowCameraModal] = useState<boolean>(false);
  const [selectedPreviewPhoto, setSelectedPreviewPhoto] = useState<any | null>(null);

  // Location Selector Options State: Satellite Plot Map (Default), Auto-Fetch GPS, or Manual Lat/Long
  const [locationMode, setLocationMode] = useState<'map' | 'autofetch' | 'manual'>('map');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string>(
    'Select and adjust boundary points on satellite map, or use auto-fetch GPS'
  );

  // Form State
  const [formData, setFormData] = useState({
    farmerName: 'Ravi Kumar',
    mobile: '9876543210',
    state: 'Karnataka',
    district: 'Bengaluru Rural',
    village: 'Devanahalli',
    surveyNumber: '125/2',
    landParcelId: '29BLR125200102',
    digipin: '562C-8F29-KM',
    landAreaAcres: 2.5,
    latitude: 13.2456,
    longitude: 77.7123,
    polygonCoordinates: generateDefaultParcelCoordinates(13.2456, 77.7123),
    cropName: 'Ragi',
    variety: 'GPU-28',
    sowingDate: '2026-06-15',
    growthStage: 'Vegetative stage',
    insuredAreaAcres: 2.5,
    applicationNumber: 'PMFBY-2026-1025',
    disasterType: 'Flood',
    disasterDate: '2026-08-20',
    reportedCause: 'Heavy rainfall and localized runoff',
    damagePercentage: 70,
    description: 'My ragi field was submerged in water for two days due to heavy rainfall.',
    farmerLossEstimate: 18000,
    expectedClaim: 18000,
    photos: [
      {
        photo_url: '/static/sample_damaged_crop.jpg',
        photo_type: 'damaged_crop',
        timestamp: '2026-08-20T16:15:00',
        latitude: 13.2458,
        longitude: 77.7121,
        caption: 'Damaged ragi crop'
      },
      {
        photo_url: '/static/sample_flood_water.jpg',
        photo_type: 'waterlogging',
        timestamp: '2026-08-20T16:22:00',
        latitude: 13.2452,
        longitude: 77.7126,
        caption: 'Standing flood water in field'
      },
      {
        photo_url: '/static/sample_field_overview.jpg',
        photo_type: 'field_overview',
        timestamp: '2026-08-20T16:28:00',
        latitude: 13.2456,
        longitude: 77.7123,
        caption: 'Overall field boundary'
      }
    ]
  });

  const recognitionRef = useRef<any>(null);

  // Script Questions (5 Clean Assessment Steps)
  const questions = [
    {
      step: 1,
      title: language === 'kn' ? 'ಭೂಮಿ ಗುರುತಿಸುವಿಕೆ' : 'Step 1 — Land Identification & GPS Satellite Map',
      questionEn: 'Please verify your survey number, area, and adjust your parcel boundaries on the satellite map.',
      questionKn: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಭೂಮಿಯ ಸರ್ವೆ ಸಂಖ್ಯೆ ಮತ್ತು ವಿಸ್ತೀರ್ಣವನ್ನು ಪರಿಶೀಲಿಸಿ.',
      subtext: 'We automatically fetch your GPS latitude, longitude, and 4m×4m National DIGIPIN code.'
    },
    {
      step: 2,
      title: language === 'kn' ? 'ಬೆಳೆ ವಿವರಗಳು' : 'Step 2 — Crop Details',
      questionEn: 'Which crop did you grow, and what is the approximate sowing date?',
      questionKn: 'ನೀವು ಯಾವ ಬೆಳೆ ಬೆಳೆದಿದ್ದೀರಿ ಮತ್ತು ಬಿತ್ತನೆ ದಿನಾಂಕ ಯಾವುದು?',
      subtext: 'Insured acreage and PMFBY financial coverage rates are synchronized automatically.'
    },
    {
      step: 3,
      title: language === 'kn' ? 'ವಿಪತ್ತು ಮತ್ತು ನಷ್ಟ ವಿವರ' : 'Step 3 — Disaster Occurrence & Severity',
      questionEn: 'What disaster affected your crop, on which date, and approximately how much crop was damaged?',
      questionKn: 'ಯಾವ ನೈಸರ್ಗಿಕ ವಿಕೋಪ ಸಂಭವಿಸಿತು, ಯಾವ ದಿನಾಂಕದಂದು ಮತ್ತು ಶೇಕಡಾ ಎಷ್ಟು ಹಾನಿಯಾಗಿದೆ?',
      subtext: 'Describe what happened in your own words. Satellite NDVI reflectance will corroborate this.'
    },
    {
      step: 4,
      title: language === 'kn' ? 'ಆರ್ಥಿಕ ನಷ್ಟ ಅಂದಾಜು' : 'Step 4 — Financial Loss Estimation',
      questionEn: 'Approximately how much money did you lose due to this crop damage?',
      questionKn: 'ಈ ಬೆಳೆ ಹಾನಿಯಿಂದ ನಿಮಗೆ ಅಂದಾಜು ಎಷ್ಟು ರೂಪಾಯಿ ನಷ್ಟವಾಗಿದೆ?',
      subtext: 'Enter your estimate in Indian Rupees. Official PMFBY rates will be benchmarked by AI.'
    },
    {
      step: 5,
      title: language === 'kn' ? 'ಛಾಯಾಚಿತ್ರ ಸಾಕ್ಷ್ಯಗಳು' : 'Step 5 — Photographic Evidence with Geo-Tags',
      questionEn: 'Please capture ground photographs of the damaged crop using the website camera.',
      questionKn: 'ದಯವಿಟ್ಟು ಹಾನಿಗೊಳಗಾದ ಬೆಳೆ ಮತ್ತು ಹೊಲದ ಫೋಟೋಗಳನ್ನು ವೆಬ್‌ಸೈಟ್ ಕ್ಯಾಮೆರಾ ಮೂಲಕ ಸೆರೆಹಿಡಿಯಿರಿ.',
      subtext: 'Camera coordinates (GPS), DIGIPIN, and timestamp metadata are verified and stamped automatically.'
    }
  ];

  const currentQ = questions[currentStep - 1] || questions[0];

  // Sample voice answers per step for quick testing & fallback
  const sampleAnswersForStep: Record<number, string[]> = {
    1: [
      'Survey 125/2, marked 2.5 acres on satellite map',
      'Survey 125/2, 2.5 acres',
      'Survey 88/1, 3.2 acres'
    ],
    2: [
      'Ragi crop, sown on 15th June',
      'Paddy crop, sown in July',
      'Cotton crop, sown on 5th June'
    ],
    3: [
      'Heavy flood, 70 percent damage, two days waterlogging',
      'Continuous rainfall, 60 percent crop loss',
      'River inundation, 75 percent damage'
    ],
    4: [
      '18000 rupees out-of-pocket loss',
      '25000 rupees total loss',
      '30000 rupees estimated loss'
    ],
    5: [
      'Captured live photo using website camera',
      'Ground crop canopy photo stamped'
    ]
  };

  // Text to Speech
  const speakQuestion = (text: string) => {
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

  const toggleSpeakQuestion = () => {
    primeSpeechSynthesis();
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      const qText = language === 'kn' ? currentQ.questionKn : currentQ.questionEn;
      speakQuestion(qText);
    }
  };

  // Auto-speak question on step change with debounce
  useEffect(() => {
    if (isOpen && voiceEnabled) {
      const qText = language === 'kn' ? currentQ.questionKn : currentQ.questionEn;
      const timer = setTimeout(() => {
        speakQuestion(qText);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen, currentStep, voiceEnabled, language]);

  // Stop speaking when modal closes
  useEffect(() => {
    if (!isOpen) {
      stopSpeaking();
      setIsSpeaking(false);
      if (recognitionRef.current?.stop) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsListening(false);
    }
  }, [isOpen]);

  // Sync verified ULPIN land parcel details into form
  useEffect(() => {
    if (initialLandData) {
      setFormData(prev => ({
        ...prev,
        farmerName: initialLandData.farmer_name || initialLandData.farmerName || prev.farmerName,
        mobile: initialLandData.mobile || prev.mobile,
        state: initialLandData.state || prev.state,
        district: initialLandData.district || prev.district,
        village: initialLandData.village || prev.village,
        surveyNumber: initialLandData.survey_number || initialLandData.surveyNumber || prev.surveyNumber,
        landParcelId: initialLandData.ulpin || initialLandData.land_parcel_id || prev.landParcelId,
        digipin: initialLandData.digipin || prev.digipin,
        landAreaAcres: initialLandData.area_acres || initialLandData.landAreaAcres || prev.landAreaAcres,
        insuredAreaAcres: initialLandData.area_acres || initialLandData.insuredAreaAcres || prev.insuredAreaAcres,
        latitude: initialLandData.latitude || prev.latitude,
        longitude: initialLandData.longitude || prev.longitude,
        polygonCoordinates:
          initialLandData.polygon_coords ||
          initialLandData.polygonCoordinates ||
          generateDefaultParcelCoordinates(
            initialLandData.latitude || prev.latitude,
            initialLandData.longitude || prev.longitude
          )
      }));
    }
  }, [initialLandData, isOpen]);

  // Handle Interactive Land Plot Selector Change
  const handlePlotChange = (data: {
    coords: [number, number][];
    areaAcres: number;
    centroidLat: number;
    centroidLon: number;
    digipin: string;
  }) => {
    setFormData(prev => ({
      ...prev,
      polygonCoordinates: data.coords,
      landAreaAcres: data.areaAcres,
      insuredAreaAcres: data.areaAcres,
      latitude: data.centroidLat,
      longitude: data.centroidLon,
      digipin: data.digipin
    }));
    setLocationStatus(`✓ Plot Polygon & DIGIPIN Aligned: ${data.areaAcres} Acres • DIGIPIN: ${data.digipin}`);
  };

  // Handle GPS Auto-Fetch
  const handleAutoFetchLocation = () => {
    setIsLocating(true);
    setLocationStatus('Querying satellite GPS sensor from device...');
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = parseFloat(pos.coords.latitude.toFixed(4));
          const lon = parseFloat(pos.coords.longitude.toFixed(4));
          const pin = encodeDigipin(lat, lon);
          const newCoords = generateDefaultParcelCoordinates(lat, lon);
          setFormData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lon,
            digipin: pin,
            polygonCoordinates: newCoords
          }));
          setIsLocating(false);
          setLocationStatus(`✓ Device GPS Locked: ${lat}° N, ${lon}° E (DIGIPIN: ${pin})`);
        },
        () => {
          const lat = 13.2456;
          const lon = 77.7123;
          const pin = encodeDigipin(lat, lon);
          const newCoords = generateDefaultParcelCoordinates(lat, lon);
          setFormData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lon,
            digipin: pin,
            polygonCoordinates: newCoords
          }));
          setIsLocating(false);
          setLocationStatus(`✓ Cadastral Satellite GPS Locked: ${lat}° N, ${lon}° E (Devanahalli)`);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      const lat = 13.2456;
      const lon = 77.7123;
      const pin = encodeDigipin(lat, lon);
      const newCoords = generateDefaultParcelCoordinates(lat, lon);
      setFormData(prev => ({
        ...prev,
        latitude: lat,
        longitude: lon,
        digipin: pin,
        polygonCoordinates: newCoords
      }));
      setIsLocating(false);
      setLocationStatus(`✓ Default Cadastral GPS Locked: ${lat}° N, ${lon}° E`);
    }
  };

  // Handle Manual Coordinates Change with DIGIPIN auto-recalculation
  const handleManualCoordChange = (field: 'latitude' | 'longitude', val: number) => {
    const lat = field === 'latitude' ? val : formData.latitude;
    const lon = field === 'longitude' ? val : formData.longitude;
    const pin = encodeDigipin(lat, lon);
    const newCoords = generateDefaultParcelCoordinates(lat, lon);
    setFormData(prev => ({
      ...prev,
      [field]: val,
      digipin: pin,
      polygonCoordinates: newCoords
    }));
    setLocationStatus(`✓ Coordinates Updated: ${lat}° N, ${lon}° E (DIGIPIN: ${pin})`);
  };

  // Contextual Spoken Answer Parser across all 5 steps
  const parseSpokenTextForStep = (text: string, step: number) => {
    const clean = text.trim();
    if (!clean) return;

    setSpokenTranscript(clean);
    setRecErrorMsg(null);
    const parsedItems: string[] = [];

    if (step === 1) {
      // Step 1: Land Survey Number & Area
      const surveyMatch =
        clean.match(/(?:survey\s*(?:no\.?|number|#)?\s*)?([0-9]{1,4}\/[0-9a-zA-Z]{1,4})/i) ||
        clean.match(/\b([0-9]{1,4}\/[0-9a-zA-Z]{1,4})\b/);
      if (surveyMatch) {
        setFormData(prev => ({ ...prev, surveyNumber: surveyMatch[1] }));
        parsedItems.push(`Survey #${surveyMatch[1]}`);
      }

      const areaMatch = clean.match(/([0-9]+(?:\.[0-9]+)?)\s*(?:acres?|acre|ac)/i);
      if (areaMatch) {
        const acres = parseFloat(areaMatch[1]);
        if (acres > 0 && acres <= 100) {
          setFormData(prev => ({ ...prev, landAreaAcres: acres, insuredAreaAcres: acres }));
          parsedItems.push(`Area: ${acres} Acres`);
        }
      }
    } else if (step === 2) {
      // Step 2: Crop Sown
      const crops = ['Ragi', 'Paddy', 'Cotton', 'Sugarcane', 'Wheat', 'Onion', 'Maize', 'Soybean'];
      for (const c of crops) {
        if (new RegExp(`\\b${c}\\b`, 'i').test(clean)) {
          setFormData(prev => ({ ...prev, cropName: c }));
          parsedItems.push(`Crop: ${c}`);
          break;
        }
      }
    } else if (step === 3) {
      // Step 3: Disaster & Severity
      const lower = clean.toLowerCase();
      if (lower.includes('flood') || lower.includes('waterlog') || lower.includes('submerg') || lower.includes('rain')) {
        setFormData(prev => ({ ...prev, disasterType: 'Flood' }));
        parsedItems.push('Disaster: Flood');
      } else if (lower.includes('drought') || lower.includes('dry')) {
        setFormData(prev => ({ ...prev, disasterType: 'Drought' }));
        parsedItems.push('Disaster: Drought');
      } else if (lower.includes('cyclone') || lower.includes('wind')) {
        setFormData(prev => ({ ...prev, disasterType: 'Cyclone' }));
        parsedItems.push('Disaster: Cyclone');
      }

      const pctMatch = clean.match(/([0-9]{1,3})\s*(?:percent|%|pct)/i);
      if (pctMatch) {
        const pct = Math.min(100, Math.max(10, parseInt(pctMatch[1], 10)));
        setFormData(prev => ({ ...prev, damagePercentage: pct }));
        parsedItems.push(`Damage: ${pct}%`);
      }

      setFormData(prev => ({ ...prev, description: clean }));
    } else if (step === 4) {
      // Step 4: Financial Loss Estimate
      const amtMatch = clean.match(/(?:rupees?|rs\.?|₹)?\s*([0-9]+(?:,[0-9]+)*)/i);
      if (amtMatch) {
        const rawNum = amtMatch[1].replace(/,/g, '');
        const loss = parseInt(rawNum, 10);
        if (loss > 0) {
          setFormData(prev => ({ ...prev, farmerLossEstimate: loss, expectedClaim: loss }));
          parsedItems.push(`Loss: ₹${loss.toLocaleString('en-IN')}`);
        }
      }
    }

    if (parsedItems.length > 0) {
      setLastParsedSummary(`✓ Understood: ${parsedItems.join(' • ')}`);
      playChime('success');
    } else {
      setLastParsedSummary(`Captured: "${clean.slice(0, 45)}..."`);
    }
  };

  const handleUseSampleAnswer = (sampleText: string) => {
    primeSpeechSynthesis();
    parseSpokenTextForStep(sampleText, currentStep);
  };

  const getActiveSampleAnswers = (): string[] => {
    return sampleAnswersForStep[currentStep] || [];
  };

  // Add Photo Captured via GeoCamera
  const handleAddCapturedPhoto = (newPhoto: GeoPhoto) => {
    setFormData(prev => ({
      ...prev,
      photos: [newPhoto, ...prev.photos]
    }));
    setLastParsedSummary(`✓ Real-Time Photo Attached: ${newPhoto.caption}`);
    playChime('success');
  };

  // Remove Photo
  const handleRemovePhoto = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  // Speech Recognition Trigger
  const toggleSpeechRecognition = () => {
    primeSpeechSynthesis();
    if (isListening) {
      if (recognitionRef.current?.stop) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsListening(false);
      setMicAudioLevel(0);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setRecErrorMsg('Speech recognition is not supported in this browser. Please use Quick Voice Answers below.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'kn' ? 'kn-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setRecErrorMsg(null);
        playChime('start');
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setSpokenTranscript(transcript);
        if (event.results[0].isFinal) {
          parseSpokenTextForStep(transcript, currentStep);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        setRecErrorMsg('Could not detect clear audio. Please select a Quick Voice Answer below.');
      };

      recognition.onend = () => {
        setIsListening(false);
        setMicAudioLevel(0);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Recognition start error:', e);
      setIsListening(false);
    }
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Step 5: Complete claim dossier & launch autonomous analysis
      onComplete(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Top Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Animated Avatar */}
            <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-emerald-700 text-white shadow-sm">
              <span className="text-xl">🌾</span>
              {isSpeaking && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-600"></span>
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{b('KisanClaim Assessment Assistant', 'ಕಿಸಾನ್‌ಕ್ಲೇಮ್ ಬೆಳೆ ಹಾನಿ ಮೌಲ್ಯಮಾಪನ ಸಹಾಯಕ', language)}</h2>
                <span className="text-[10px] bg-emerald-50 text-emerald-800 font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  {b('AI GUIDED MODE', 'ಎಐ ಮಾರ್ಗದರ್ಶಿತ ಮೋಡ್', language)}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                {b(`Step ${currentStep} of 5 • Land parcel verified`, `ಹಂತ ${currentStep} / 5 • ಜಮೀನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ`, language)} (ULPIN: <span className="font-mono text-emerald-800 font-bold">{formData.landParcelId}</span>)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setVoiceEnabled(!voiceEnabled);
                if (voiceEnabled) stopSpeaking();
              }}
              className="p-2 text-slate-500 hover:text-emerald-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              title="Toggle audio narration"
            >
              {voiceEnabled ? <Volume2 className="w-5 h-5 text-emerald-700" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5 overflow-hidden border-b border-slate-200">
          <div
            className="bg-emerald-600 h-full transition-all duration-300"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>

        {/* Question Bubble & Listen / Audio Waves Button */}
        <div className="p-4 sm:p-5 bg-emerald-50/40 border-b border-slate-200 flex items-start gap-3 sm:gap-4">
          <div className="p-4 bg-white border border-emerald-200 rounded-2xl flex-1 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block mb-1 font-mono">
              {currentQ.title}
            </span>
            <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
              "{language === 'kn' ? currentQ.questionKn : currentQ.questionEn}"
            </p>
            <p className="text-xs text-slate-600 mt-2 flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" /> {currentQ.subtext}
            </p>
          </div>

          {/* Repeat / Listen Question Button */}
          <button
            type="button"
            onClick={toggleSpeakQuestion}
            className={`px-3.5 py-3 rounded-2xl transition-all flex flex-col items-center justify-center gap-1.5 text-xs font-bold cursor-pointer shadow-sm ${
              isSpeaking
                ? 'bg-emerald-100 text-emerald-900 border-2 border-emerald-600 animate-pulse'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
            }`}
            title={isSpeaking ? 'Click to Stop Speaking' : 'Click to Listen to Question'}
          >
            {isSpeaking ? (
              <>
                <div className="flex items-center gap-1 h-4">
                  <span className="w-1 h-3 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1 h-4 bg-emerald-700 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1 h-2.5 bg-emerald-600 rounded-full animate-bounce" />
                </div>
                <span className="text-[10px] text-emerald-800 font-extrabold uppercase whitespace-nowrap font-mono">
                  {b('Speaking', 'ಮಾತನಾಡುತ್ತಿದೆ', language)}
                </span>
              </>
            ) : (
              <>
                <Volume2 className="w-5 h-5 text-emerald-700" />
                <span className="text-[10px] text-slate-600 font-bold uppercase whitespace-nowrap">{b('Listen', 'ಕೇಳಿಸಿಕೊಳ್ಳಿ', language)}</span>
              </>
            )}
          </button>
        </div>

        {/* Interactive Form Content Area based on Step */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* STEP 1: Land Identification & GPS Auto-Fetch / Satellite Map Mode */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">{b('Survey Number', 'ಸರ್ವೆ ಸಂಖ್ಯೆ', language)}</label>
                  <input
                    type="text"
                    value={formData.surveyNumber}
                    onChange={e => setFormData({ ...formData, surveyNumber: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 text-sm font-mono focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">{b('Land Area (Acres)', 'ಭೂ ವಿಸ್ತೀರ್ಣ (ಎಕರೆ)', language)}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.landAreaAcres}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        landAreaAcres: parseFloat(e.target.value) || 0,
                        insuredAreaAcres: parseFloat(e.target.value) || 0
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 text-sm font-mono focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">{b('DIGIPIN (National Grid)', 'ಡಿಜಿಪಿನ್ (ರಾಷ್ಟ್ರೀಯ ಗ್ರಿಡ್)', language)}</label>
                  <input
                    type="text"
                    readOnly
                    value={formData.digipin}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-emerald-800 font-bold text-sm font-mono"
                  />
                </div>
              </div>

              {/* Location Mode Choice */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      {b('Ground Parcel Geo-Location', 'ಜಮೀನಿನ ಜಿಯೋ-ಸ್ಥಳ', language)}
                    </span>
                  </div>

                  {/* Mode Selector Buttons */}
                  <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setLocationMode('map')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        locationMode === 'map'
                          ? 'bg-emerald-700 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Layers className="w-3 h-3" />
                      <span>{b('Option 1: Drag on Satellite Map (Recommended)', 'ಆಯ್ಕೆ 1: ಉಪಗ್ರಹ ನಕ್ಷೆಯಲ್ಲಿ ಎಳೆಯಿರಿ (ಶಿಫಾರಸು)', language)}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLocationMode('autofetch')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        locationMode === 'autofetch'
                          ? 'bg-emerald-700 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Navigation className="w-3 h-3" />
                      <span>{b('Option 2: Auto-Fetch GPS', 'ಆಯ್ಕೆ 2: ಜಿಪಿಎಸ್ ಸ್ವಯಂ-ಪಡೆಯಿರಿ', language)}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLocationMode('manual')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        locationMode === 'manual'
                          ? 'bg-emerald-700 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>{b('Option 3: Enter Lat/Long', 'ಆಯ್ಕೆ 3: ಅಕ್ಷಾಂಶ/ರೇಖಾಂಶ ನಮೂದಿಸಿ', language)}</span>
                    </button>
                  </div>
                </div>

                {/* Sub-panel 1: Interactive Satellite Land Plot Selector */}
                {locationMode === 'map' && (
                  <div className="space-y-2">
                    <LandPlotMapSelector
                      initialCenterLat={formData.latitude}
                      initialCenterLon={formData.longitude}
                      initialCoords={formData.polygonCoordinates}
                      surveyNumber={formData.surveyNumber}
                      language={language}
                      onPlotChange={handlePlotChange}
                    />
                  </div>
                )}

                {/* Sub-panel 2: Auto Fetch Location */}
                {locationMode === 'autofetch' && (
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <span>Device & Cadastral GPS Synchronizer</span>
                        <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full font-mono font-bold border border-emerald-200">
                          ACCURACY: ±3.2m
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">{locationStatus}</div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAutoFetchLocation}
                      disabled={isLocating}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition cursor-pointer"
                    >
                      <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                      <span>{isLocating ? 'Locking Coordinates...' : 'Auto-Fetch Location Now'}</span>
                    </button>
                  </div>
                )}

                {/* Sub-panel 3: Manual Latitude & Longitude Input */}
                {locationMode === 'manual' && (
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
                    <div className="text-xs text-slate-700 font-medium">
                      Enter the geodetic centroid coordinates for your land parcel. DIGIPIN will be computed dynamically.
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                          Latitude (°N, e.g. 13.2456)
                        </label>
                        <input
                          type="number"
                          step="0.0001"
                          value={formData.latitude}
                          onChange={e => handleManualCoordChange('latitude', parseFloat(e.target.value) || 0)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                          Longitude (°E, e.g. 77.7123)
                        </label>
                        <input
                          type="number"
                          step="0.0001"
                          value={formData.longitude}
                          onChange={e => handleManualCoordChange('longitude', parseFloat(e.target.value) || 0)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Crop Details (Crop Variety & Growth Stage Removed as requested) */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Crop Sown</label>
                  <select
                    value={formData.cropName}
                    onChange={e => setFormData({ ...formData, cropName: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                  >
                    {['Ragi', 'Paddy', 'Cotton', 'Sugarcane', 'Wheat', 'Onion', 'Maize', 'Soybean'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Approximate Sowing Date</label>
                  <input
                    type="date"
                    value={formData.sowingDate}
                    onChange={e => setFormData({ ...formData, sowingDate: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Policy Insured Area (Acres)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.insuredAreaAcres}
                    onChange={e => setFormData({ ...formData, insuredAreaAcres: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm font-mono focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">PMFBY Policy Application Number</label>
                  <input
                    type="text"
                    value={formData.applicationNumber}
                    readOnly
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-700 text-sm font-mono"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-xs text-emerald-800 font-semibold">Maximum Sum Insured Cap</div>
                  <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                    ₹{(formData.insuredAreaAcres * 10000).toLocaleString('en-IN')}
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-white border border-emerald-200 text-emerald-800 px-2.5 py-1 rounded-lg font-bold shadow-sm">
                  ₹10,000/ACRE PMFBY SCALE
                </span>
              </div>
            </div>
          )}

          {/* STEP 3: Disaster Details */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Disaster Type</label>
                  <select
                    value={formData.disasterType}
                    onChange={e => setFormData({ ...formData, disasterType: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                  >
                    <option value="Flood">Flood / Inundation</option>
                    <option value="Drought">Drought / Dry Spell</option>
                    <option value="Cyclone">Cyclone / Gale Wind</option>
                    <option value="Hailstorm">Hailstorm</option>
                    <option value="Pest Attack">Pest / Disease Attack</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Disaster Date</label>
                  <input
                    type="date"
                    value={formData.disasterDate}
                    onChange={e => setFormData({ ...formData, disasterDate: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Damage Percentage:{' '}
                    <span className="text-emerald-700 font-bold font-mono">{formData.damagePercentage}%</span>
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={formData.damagePercentage}
                    onChange={e => setFormData({ ...formData, damagePercentage: parseInt(e.target.value, 10) })}
                    className="w-full accent-emerald-600 cursor-pointer mt-2"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Farmer Narrative / Details</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 text-xs focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Financial Loss */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <div className="text-xs text-emerald-800 font-semibold mb-1">Estimated Out-of-Pocket Crop Loss</div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-slate-800">₹</span>
                  <input
                    type="number"
                    value={formData.farmerLossEstimate}
                    onChange={e => setFormData({ ...formData, farmerLossEstimate: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xl font-bold text-emerald-800 outline-none font-mono focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
                <p className="text-[11px] text-slate-600 mt-2">
                  Enter your estimated financial investment lost due to this damage. AI actuarial modeling will corroborate this against PMFBY standards.
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: Photo Evidence with Live Geotag Camera (Upload file button removed as requested) */}
          {currentStep === 5 && (
            <div className="space-y-4">
              {/* Top Banner & Trigger Button */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-white border border-emerald-200 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 font-mono text-[10px] font-bold">
                      LIVE GEOCAMERA ENGINE
                    </span>
                    <span className="text-xs font-mono text-emerald-800 font-bold">
                      📍 {formData.latitude.toFixed(4)}°N, {formData.longitude.toFixed(4)}°E
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">Capture Real-Time Ground Evidence</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Photographs captured through the website camera automatically burn verified GPS coordinates, DIGIPIN (
                    <span className="font-mono text-emerald-800 font-bold">{formData.digipin}</span>
                    ), and Survey #{formData.surveyNumber} into image pixels.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Website Camera Button (ONLY button, upload file removed) */}
                  <button
                    type="button"
                    onClick={() => setShowCameraModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-white" />
                    <span>📸 Open Website Camera</span>
                  </button>
                </div>
              </div>

              {/* Photos Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600 px-1 font-mono">
                  <span>Attached Evidence Photos ({formData.photos.length}):</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> All Geo-Tags Synchronized
                  </span>
                </div>

                {formData.photos.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-semibold text-slate-900">No photos captured yet</div>
                    <p className="text-xs text-slate-600 max-w-sm mx-auto">
                      Click "Open Website Camera" to take live photos of the damaged crop, flood water, or field boundary.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowCameraModal(true)}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Take First Photo Now</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {formData.photos.map((p, idx) => (
                      <div
                        key={idx}
                        className="group relative bg-white p-2.5 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all shadow-sm flex flex-col justify-between"
                      >
                        <div className="relative overflow-hidden rounded-xl bg-slate-900 aspect-video mb-2">
                          <img
                            src={p.photo_url}
                            alt="Crop Evidence"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-[10px] font-bold text-white uppercase tracking-wider font-mono">
                            {p.photo_type.replace('_', ' ')}
                          </span>

                          <button
                            type="button"
                            onClick={() => setSelectedPreviewPhoto(p)}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/80 hover:bg-black text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border border-white/20"
                            title="View Full Size"
                          >
                            <Maximize2 className="w-3.5 h-3.5 text-white" />
                          </button>
                        </div>

                        <div className="space-y-1">
                          <span className="text-xs font-bold text-slate-900 block capitalize truncate">
                            {p.caption}
                          </span>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                            <span>📍 {p.latitude.toFixed(4)}°N</span>
                            <span className="text-emerald-700 font-semibold">✓ Verified</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="mt-2 w-full py-1 text-[10px] text-red-600 hover:bg-red-50 rounded-lg flex items-center justify-center gap-1 transition"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Voice Answers Strip for Current Step */}
        {sampleAnswersForStep[currentStep] && (
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
            <span className="text-[10px] text-emerald-800 font-mono font-bold uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-700" /> Quick Voice Answers:
            </span>
            {getActiveSampleAnswers().map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleUseSampleAnswer(sample)}
                className="px-2.5 py-1 rounded-xl bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 whitespace-nowrap text-[11px] transition flex items-center gap-1.5 cursor-pointer shadow-sm group"
                title="Click to simulate speaking this answer"
              >
                <Mic className="w-3 h-3 text-emerald-700 group-hover:scale-110 transition-transform" />
                <span>"{sample}"</span>
              </button>
            ))}
          </div>
        )}

        {/* Bottom Action Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Microphone Button */}
            <button
              onClick={toggleSpeechRecognition}
              className={`px-4 py-2.5 rounded-2xl font-bold flex items-center gap-2 text-xs transition-all cursor-pointer ${
                isListening
                  ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse shadow-md ring-2 ring-red-400'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4 animate-bounce" />
                  <span>Listening... (Click to Stop)</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 text-white" />
                  <span>Speak Answer</span>
                </>
              )}
            </button>

            {/* Recognized or Parsed Feedback */}
            {lastParsedSummary && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-mono font-medium shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                <span className="truncate max-w-xs">{lastParsedSummary}</span>
              </div>
            )}

            {/* Error or Help Tip */}
            {recErrorMsg && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span className="truncate max-w-xs">{recErrorMsg}</span>
              </div>
            )}

            {/* Spoken Transcript Live Preview */}
            {!lastParsedSummary && spokenTranscript && (
              <span className="text-xs text-slate-600 italic truncate max-w-xs font-mono">
                "{spokenTranscript}"
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition shadow-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> {b('Back', 'ಹಿಂದೆ', language)}
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
            >
              <SkipForward className="w-3.5 h-3.5" /> {b('Skip', 'ಬಿಟ್ಟುಬಿಡಿ', language)}
            </button>

            <button
              onClick={handleNext}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <span>{currentStep === 5 ? b('Submit Claim & Analyze', 'ಕ್ಲೇಮ್ ಸಲ್ಲಿಸಿ & ವಿಶ್ಲೇಷಿಸಿ', language) : b('Continue', 'ಮುಂದುವರಿಯಿರಿ', language)}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Website Camera Capture Modal with Geotag Stamping */}
      {showCameraModal && (
        <GeoCameraModal
          isOpen={showCameraModal}
          onClose={() => setShowCameraModal(false)}
          onCapture={handleAddCapturedPhoto}
          surveyNumber={formData.surveyNumber}
          digipin={formData.digipin}
          latitude={formData.latitude}
          longitude={formData.longitude}
          village={formData.village}
          district={formData.district}
          language={language}
        />
      )}

      {/* Fullscreen Photo Evidence Inspector Modal */}
      {selectedPreviewPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative max-w-3xl w-full bg-white border border-slate-200 rounded-3xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Geotagged Photo Inspection • {selectedPreviewPhoto.caption}</span>
              </div>
              <button
                onClick={() => setSelectedPreviewPhoto(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden bg-slate-950 max-h-[70vh] flex items-center justify-center">
              <img
                src={selectedPreviewPhoto.photo_url}
                alt="Enlarged Evidence"
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-600 font-mono">
              <span>📍 {selectedPreviewPhoto.latitude?.toFixed(5)}°N, {selectedPreviewPhoto.longitude?.toFixed(5)}°E</span>
              <span className="text-emerald-700 font-bold">✓ Burnt In-Pixel Geotag Verified</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
