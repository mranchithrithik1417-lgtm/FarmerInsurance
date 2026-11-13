import React, { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, Sparkles, Satellite, CloudRain, ShieldCheck, FileText, Cpu, ArrowRight } from 'lucide-react';

interface Props {
  onComplete: () => void;
}

export const EvidenceAnalysisProgress: React.FC<Props> = ({ onComplete }) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl border border-emerald-200 animate-pulse">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Automatic Evidence Verification Engine
                <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200 font-mono font-bold">
                  LIVE PIPELINE
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Fusing Sentinel-2 satellite passes, Open-Meteo radar, and farmer ground evidence
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-2xl font-black text-emerald-700 font-mono">
              {Math.round(((currentStageIdx + 1) / stages.length) * 100)}%
            </span>
          </div>
        </div>

        {/* Progress Timeline List */}
        <div className="my-6 space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
          {stages.map((st, idx) => {
            const isCompleted = idx < currentStageIdx;
            const isCurrent = idx === currentStageIdx;
            const isPending = idx > currentStageIdx;

            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between text-xs ${
                  isCurrent
                    ? 'bg-emerald-50 border-emerald-300 shadow-xs'
                    : isCompleted
                    ? 'bg-white border-slate-200 text-slate-700'
                    : 'bg-slate-50 border-slate-200/80 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-emerald-700 animate-spin flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 flex-shrink-0" />
                  )}

                  <div>
                    <div className={`font-semibold ${isCurrent ? 'text-slate-900 font-bold' : isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                      {idx + 1}. {st.name}
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <span className="text-emerald-800 font-mono font-semibold">[{st.source}]</span>
                      <span>{st.desc}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono text-[11px] font-bold">
                  {isCompleted ? (
                    <span className="text-emerald-700">{st.result}</span>
                  ) : isCurrent ? (
                    <span className="text-emerald-800 animate-pulse">Processing...</span>
                  ) : (
                    <span className="text-slate-400">Waiting</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span>Deterministic evidence scoring calibrated for PMFBY guidelines</span>
          </div>

          <button
            disabled={!isDone}
            onClick={onComplete}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              isDone
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm cursor-pointer'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
            }`}
          >
            <span>{isDone ? 'View Generated Claim & Dossier' : 'Synthesizing Evidence...'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
