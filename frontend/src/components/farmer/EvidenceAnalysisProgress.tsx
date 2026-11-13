import React, { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, Sparkles, Cpu, ArrowRight } from 'lucide-react';
import { b } from '../../utils/translations';

interface Props {
  onComplete: () => void;
  language?: 'en' | 'kn';
}

export const EvidenceAnalysisProgress: React.FC<Props> = ({ onComplete, language = 'en' }) => {
  const [currentStageIdx, setCurrentStageIdx] = useState<number>(0);

  const stages = [
    { name: 'Farmer Information Validation', source: 'Kisan Identity Core', desc: 'Validating registration records and mobile linkage', result: '✓ Verified' },
    { name: 'Field Location & Google Earth Demarcation', source: 'Google Earth 3D & DIGIPIN', desc: 'Pinpointing 3D terrain coordinates and cadastral centroid on Google Earth', result: '✓ Located on Google Earth' },
    { name: 'Land Boundary Analysis', source: 'Bhoomi Karnataka Land GIS', desc: 'Demarcating cadastral polygon survey #125/2 (2.5 ac)', result: '✓ Polygon Sealed' },
    { name: 'Dynamic Satellite Image Retrieval', source: 'Sentinel-2 MSI & Google Earth Engine', desc: 'Acquiring pre & post multispectral MSI scenes dynamically', result: '✓ Level-2A Ingested' },
    { name: 'Before-and-After Satellite Comparison', source: 'Optical Radiance Engine', desc: 'Aligning band 4 (Red) & band 8 (NIR) raster tiles', result: '✓ Co-registered' },
    { name: 'NDVI Vegetation Analysis', source: 'Vegetation Spectral Index Engine', desc: 'Calculating canopy difference (0.74 -> 0.28)', result: '✓ -62.16% Drop' },
    { name: 'Rainfall & Meteorological Verification', source: 'Open-Meteo & IMD Radar Reanalysis', desc: 'Scanning precipitation anomaly envelope (142.5 mm)', result: '✓ 4.95x Anomaly Confirmed' },
    { name: 'Geo-Tagged Photo Validation', source: 'EXIF Forensic & Geofence Sensor', desc: 'Cross-verifying camera timestamp & geodetic offset', result: '✓ 32m Geofence Match' },
    { name: 'Crop Damage Assessment', source: 'Autonomous Damage Classifier', desc: 'Fusing flood inundation mask with ragi crop phenology', result: '✓ 70% Severe Loss' },
    { name: 'Evidence Confidence Calculation', source: 'Multi-Agent Actuarial Synthesizer', desc: 'Evaluating evidentiary coherence across 5 dimensions', result: '✓ 89/100 Confidence' },
    { name: 'Claim Intelligence Report Generation', source: 'KisanClaim Dossier Compiler', desc: 'Compiling multi-page verified assessment document', result: '✓ Dossier Ready' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStageIdx(prev => {
        if (prev < stages.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          return prev;
        }
      });
    }, 600);

    return () => clearInterval(timer);
  }, []);

  const isDone = currentStageIdx >= stages.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#090D16]/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col text-slate-100">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-2xl border border-cyan-500/30 animate-pulse">
              <Cpu className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {b('Automatic Evidence Verification Engine', 'ಸ್ವಯಂಚಾಲಿತ ಪುರಾವೆ ಪರಿಶೀಲನಾ ಎಂಜಿನ್', language)}
                <span className="text-[10px] bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30 font-mono font-bold">
                  {b('LIVE PIPELINE', 'ಲೈವ್ ಪ್ರಕ್ರಿಯೆ', language)}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {b(
                  'Fusing Sentinel-2 satellite passes, Open-Meteo radar, and farmer ground evidence',
                  'ಸೆಂಟಿನೆಲ್-2 ಉಪಗ್ರಹ, ಓಪನ್-ಮೀಟಿಯೋ ರೇಡಾರ್ ಮತ್ತು ರೈತರ ಭೂ ಸಾಕ್ಷ್ಯಗಳ ಸಮ್ಮಿಲನ',
                  language
                )}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-2xl font-black text-cyan-400 font-mono">
              {Math.round(((currentStageIdx + 1) / stages.length) * 100)}%
            </span>
          </div>
        </div>

        {/* Progress Timeline List */}
        <div className="my-6 space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
          {stages.map((st, idx) => {
            const isCompleted = idx < currentStageIdx;
            const isCurrent = idx === currentStageIdx;

            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between text-xs ${
                  isCurrent
                    ? 'bg-cyan-950/40 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.2)] ring-1 ring-cyan-500/50'
                    : isCompleted
                    ? 'bg-slate-900/70 border-slate-800 text-slate-200'
                    : 'bg-slate-950/50 border-slate-800/60 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-700 flex-shrink-0" />
                  )}

                  <div>
                    <div className={`font-semibold ${isCurrent ? 'text-white' : isCompleted ? 'text-slate-200' : 'text-slate-500'}`}>
                      {idx + 1}. {st.name}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span className="text-cyan-400 font-mono font-medium">[{st.source}]</span>
                      <span>{st.desc}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono text-[11px] font-bold">
                  {isCompleted ? (
                    <span className="text-cyan-400">{st.result}</span>
                  ) : isCurrent ? (
                    <span className="text-cyan-300 animate-pulse">Processing...</span>
                  ) : (
                    <span className="text-slate-500">Waiting</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>{b('Deterministic evidence scoring calibrated for PMFBY guidelines', 'ಪಿಎಂಎಫ್‌ಬಿವೈ ನಿಯಮಾವಳಿಗೆ ಅನುಗುಣವಾದ ಪುರಾವೆ ಮೌಲ್ಯಮಾಪನ', language)}</span>
          </div>

          <button
            disabled={!isDone}
            onClick={onComplete}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              isDone
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer'
                : 'bg-slate-800/80 text-slate-500 cursor-not-allowed border border-slate-700/60'
            }`}
          >
            <span>{isDone ? b('View Generated Claim & Dossier', 'ಸಿದ್ಧಪಡಿಸಿದ ಕ್ಲೇಮ್ & ಕಡತ ವೀಕ್ಷಿಸಿ', language) : b('Synthesizing Evidence...', 'ಪುರಾವೆಗಳನ್ನು ಸಂಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...', language)}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
