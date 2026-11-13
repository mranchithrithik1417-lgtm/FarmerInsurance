import React, { useState, useEffect } from 'react';
import { 
  Compass, Play, RotateCcw, ChevronLeft, ChevronRight, 
  Copy, Check, MapPin, Search, Layers, Info, Award
} from 'lucide-react';
import { api, DigipinHierarchyResponse, DigipinDecodeResponse } from '../services/api';

export const DigipinExplorerPage: React.FC = () => {
  const [latInput, setLatInput] = useState<number>(28.622788);
  const [lonInput, setLonInput] = useState<number>(77.213033);
  const [hierarchyData, setHierarchyData] = useState<DigipinHierarchyResponse | null>(null);
  const [currentLevelIdx, setCurrentLevelIdx] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Decode Tab state
  const [decodeInput, setDecodeInput] = useState<string>('39J49LL8T4');
  const [decodedResult, setDecodedResult] = useState<DigipinDecodeResponse | null>(null);
  const [decodeLoading, setDecodeLoading] = useState<boolean>(false);
  const [decodeError, setDecodeError] = useState<string>('');

  // Load initial hierarchy for Dak Bhawan
  useEffect(() => {
    fetchHierarchy(latInput, lonInput);
  }, []);

  const fetchHierarchy = async (lat: number, lon: number) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.getDigipinHierarchy(lat, lon);
      setHierarchyData(res);
      setCurrentLevelIdx(0);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate DIGIPIN hierarchy');
    } finally {
      setLoading(false);
    }
  };

  const handlePreset = (lat: number, lon: number) => {
    setLatInput(lat);
    setLonInput(lon);
    fetchHierarchy(lat, lon);
  };

  // Step-by-step auto-animation
  useEffect(() => {
    let timer: any;
    if (isAnimating) {
      if (currentLevelIdx < 9) {
        timer = setTimeout(() => {
          setCurrentLevelIdx((prev) => prev + 1);
        }, 1200);
      } else {
        setIsAnimating(false);
      }
    }
    return () => clearTimeout(timer);
  }, [isAnimating, currentLevelIdx]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDecode = async () => {
    setDecodeLoading(true);
    setDecodeError('');
    try {
      const res = await api.decodeDigipin(decodeInput);
      setDecodedResult(res);
    } catch (err: any) {
      setDecodeError(err.message || 'Invalid DIGIPIN code');
    } finally {
      setDecodeLoading(false);
    }
  };

  const currentLevel = hierarchyData?.levels[currentLevelIdx];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-forest-900 via-forest-800 to-navy-800 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
          <Compass className="w-96 h-96" />
        </div>
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-700/60 text-xs font-semibold tracking-wider uppercase text-emerald-200 border border-forest-600/40">
            <Award className="w-3.5 h-3.5 text-gold-500" />
            Official India Post Specification (EPSG:4326)
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Interactive DIGIPIN 4×4 Grid Explorer
          </h1>
          <p className="text-forest-100 text-sm sm:text-base leading-relaxed">
            Discover how any coordinate across India is mapped into a 10-character Digital Postal Index Number 
            through a recursive 10-level hierarchical 4×4 spatial subdivision.
          </p>
        </div>
      </div>

      {/* Control Strip & Presets */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Latitude (°N) [2.5 - 38.5]
              </label>
              <input
                type="number"
                step="0.000001"
                value={latInput}
                onChange={(e) => setLatInput(parseFloat(e.target.value) || 0)}
                className="w-36 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-forest-600 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Longitude (°E) [63.5 - 99.5]
              </label>
              <input
                type="number"
                step="0.000001"
                value={lonInput}
                onChange={(e) => setLonInput(parseFloat(e.target.value) || 0)}
                className="w-36 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-forest-600 focus:outline-none font-mono"
              />
            </div>
            <div className="pt-5">
              <button
                type="button"
                onClick={() => fetchHierarchy(latInput, lonInput)}
                disabled={loading}
                className="px-5 py-2 text-sm font-semibold rounded-xl bg-forest-800 hover:bg-forest-900 text-white shadow-sm transition flex items-center gap-1.5"
              >
                <Search className="w-4 h-4" />
                {loading ? "Computing..." : "Generate DIGIPIN"}
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Presets:</span>
            <button
              onClick={() => handlePreset(28.622788, 77.213033)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition"
            >
              Dak Bhawan, New Delhi (Official Test)
            </button>
            <button
              onClick={() => handlePreset(12.6020, 77.0230)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
            >
              Mandya Paddy Farm
            </button>
            <button
              onClick={() => handlePreset(13.0827, 80.2707)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
            >
              Chennai Hub
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
            {errorMsg}
          </div>
        )}
      </div>

      {/* Main 10-Level Visualization Section */}
      {hierarchyData && currentLevel && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: 4x4 Grid Matrix */}
          <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-forest-700 uppercase tracking-wider">
                  Level {currentLevel.level} of 10
                </span>
                <h3 className="text-lg font-bold text-navy-900">{currentLevel.title}</h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Angular Grid Step</span>
                <span className="font-mono text-xs font-semibold text-slate-700">
                  {currentLevel.lat_step_deg.toFixed(6)}° × {currentLevel.lon_step_deg.toFixed(6)}°
                </span>
              </div>
            </div>

            {/* 4x4 Interactive Official Character Matrix */}
            <div className="space-y-2">
              <div className="text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-2">
                <span>North</span>
                <div className="h-px bg-slate-200 flex-1" />
              </div>

              <div className="grid grid-cols-4 gap-2.5 aspect-square p-3 bg-slate-50 rounded-2xl border border-slate-200">
                {currentLevel.grid_cells.map((rowArr, rIdx) =>
                  rowArr.map((cell, cIdx) => {
                    const isSel = cell.is_selected;
                    return (
                      <div
                        key={`${rIdx}-${cIdx}`}
                        className={`relative rounded-xl border flex flex-col items-center justify-center transition-all duration-300 ${
                          isSel
                            ? 'bg-forest-800 text-white border-forest-900 shadow-md scale-[1.03] ring-4 ring-forest-500/30 z-10'
                            : 'bg-white text-slate-800 border-slate-200 hover:border-forest-300 hover:bg-forest-50/50'
                        }`}
                      >
                        <span className={`text-2xl sm:text-3xl font-extrabold font-mono ${isSel ? 'text-gold-400' : 'text-navy-900'}`}>
                          {cell.char}
                        </span>
                        <span className={`text-[10px] font-mono mt-0.5 ${isSel ? 'text-forest-200' : 'text-slate-400'}`}>
                          [{cell.row},{cell.col}]
                        </span>
                        {isSel && (
                          <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 bg-gold-500 text-slate-900 text-[9px] font-black rounded-full shadow">
                            HIT
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-2">
                <div className="h-px bg-slate-200 flex-1" />
                <span>South</span>
              </div>
            </div>

            {/* Step Controls */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentLevelIdx((prev) => Math.max(0, prev - 1))}
                  disabled={currentLevelIdx === 0}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition"
                  title="Previous Level"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentLevelIdx((prev) => Math.min(9, prev + 1))}
                  disabled={currentLevelIdx === 9}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition"
                  title="Next Level"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentLevelIdx(0);
                    setIsAnimating(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-forest-100 text-forest-800 hover:bg-forest-200 transition"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  {isAnimating ? "Simulating..." : "Auto Step-by-Step"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAnimating(false);
                    setCurrentLevelIdx(0);
                  }}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                  title="Reset to Level 1"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Code Progression & Explanations */}
          <div className="lg:col-span-6 space-y-6">
            {/* Accumulated DIGIPIN Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Target Coordinate Result
                </span>
                <span className="text-xs font-mono text-slate-500">
                  {hierarchyData.target_lat.toFixed(6)}°N, {hierarchyData.target_lon.toFixed(6)}°E
                </span>
              </div>

              <div className="bg-forest-900 text-white p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                    Official 10-Character DIGIPIN
                  </div>
                  <div className="text-3xl font-extrabold font-mono tracking-widest text-gold-400 mt-1">
                    {hierarchyData.digipin}
                  </div>
                  <div className="text-xs text-forest-200 mt-1">
                    Display: <span className="font-mono font-bold text-white">{hierarchyData.display_format}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleCopy(hierarchyData.digipin)}
                  className="p-2.5 rounded-xl bg-forest-800 hover:bg-forest-700 text-white transition flex items-center gap-1.5 text-xs font-medium"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              {/* Progress Tracker (Levels 1 to 10) */}
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-2">Hierarchical Progression:</div>
                <div className="grid grid-cols-10 gap-1.5">
                  {hierarchyData.levels.map((lvl, idx) => {
                    const isDone = idx <= currentLevelIdx;
                    const isCurr = idx === currentLevelIdx;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setIsAnimating(false);
                          setCurrentLevelIdx(idx);
                        }}
                        className={`py-2 text-center rounded-lg font-mono font-bold text-xs transition ${
                          isCurr
                            ? 'bg-forest-800 text-gold-400 ring-2 ring-forest-600 shadow'
                            : isDone
                            ? 'bg-emerald-100 text-forest-900 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {lvl.char}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Educational Breakdown */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-forest-800 font-bold text-sm">
                <Info className="w-4 h-4" />
                Level {currentLevel.level} Subdivision Insights
              </div>

              <p className="text-sm text-slate-700 leading-relaxed bg-forest-50/60 p-4 rounded-xl border border-forest-100">
                {currentLevel.explanation}
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Subregion Boundaries</span>
                  <div className="font-mono mt-1 text-slate-700 space-y-0.5">
                    <div>Lat: {currentLevel.selected_bounds.min_lat.toFixed(5)}° to {currentLevel.selected_bounds.max_lat.toFixed(5)}°</div>
                    <div>Lon: {currentLevel.selected_bounds.min_lon.toFixed(5)}° to {currentLevel.selected_bounds.max_lon.toFixed(5)}°</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Accumulated Prefix</span>
                  <div className="font-mono text-base font-extrabold text-navy-900 mt-1">
                    {currentLevel.accumulated_prefix}
                  </div>
                  <span className="text-[10px] text-slate-500">Character {currentLevel.level} of 10</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reverse Decode Section */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <h3 className="text-xl font-bold text-navy-900">Official DIGIPIN Decoder</h3>
          <p className="text-xs text-slate-500 mt-1">
            Reverse-lookup any 10-character code into its exact geometric center point coordinate and cell bounding box.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            maxLength={10}
            value={decodeInput}
            onChange={(e) => setDecodeInput(e.target.value.toUpperCase())}
            placeholder="e.g. 39J49LL8T4"
            className="w-64 px-4 py-2.5 text-base font-mono font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-forest-600 focus:outline-none tracking-widest uppercase"
          />
          <button
            type="button"
            onClick={handleDecode}
            disabled={decodeLoading}
            className="px-6 py-2.5 text-sm font-semibold rounded-xl bg-navy-800 hover:bg-navy-900 text-white shadow-sm transition"
          >
            {decodeLoading ? "Decoding..." : "Reverse Decode"}
          </button>
        </div>

        {decodeError && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
            {decodeError}
          </div>
        )}

        {decodedResult && (
          <div className="p-5 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Decoded Center Coordinate</span>
                <span className="text-xl font-extrabold font-mono text-forest-900">
                  {decodedResult.center_lat.toFixed(6)}° N, {decodedResult.center_lon.toFixed(6)}° E
                </span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Ground Physical Cell Size</span>
                <span className="text-base font-extrabold text-navy-900 font-mono">
                  {decodedResult.cell_height_m_approx}m × {decodedResult.cell_width_m_approx}m
                </span>
              </div>
            </div>

            <div className="text-xs font-mono text-slate-600 pt-2 border-t border-emerald-200/60">
              Bounding Box: [{decodedResult.min_lat}°N, {decodedResult.min_lon}°E] to [{decodedResult.max_lat}°N, {decodedResult.max_lon}°E]
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
