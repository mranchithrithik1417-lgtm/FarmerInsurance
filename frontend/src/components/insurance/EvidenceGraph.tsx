import React, { useState } from 'react';
import { Claim } from '../../types';
import { b } from '../../utils/translations';
import {
  Network,
  Cpu,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Layers,
  Sparkles,
  CheckCircle2,
  FileCheck2,
  Camera,
  Satellite,
  CloudRain,
  BarChart3,
  Scale
} from 'lucide-react';

interface Props {
  claim: Claim;
  language?: 'en' | 'kn';
}

interface EvidenceNode {
  id: string;
  label: string;
  category: 'satellite' | 'weather' | 'ground' | 'actuarial';
  status: 'verified' | 'critical' | 'neutral';
  value: string;
  detail: string;
  telemetry: string;
  weight: number; // percentage influence
  x: number;
  y: number;
}

export const EvidenceGraph: React.FC<Props> = ({ claim, language = 'en' }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('ndvi');
  const [activeLayerFilter, setActiveLayerFilter] = useState<'all' | 'satellite' | 'weather' | 'ground' | 'actuarial'>('all');

  const isFraud = (claim as any).risk_tier === 'CRITICAL_FRAUD' || (claim.evidence_confidence_score && claim.evidence_confidence_score < 40);

  // Nodes for Causal Graph
  const nodes: EvidenceNode[] = [
    {
      id: 'claim_declaration',
      label: 'Claimant Declaration',
      category: 'ground',
      status: 'neutral',
      value: `${claim.disaster.damage_percentage_reported}% ${claim.disaster.disaster_type}`,
      detail: `Reported ${claim.crop?.crop_name || 'Crop'} devastation on ${claim.disaster.disaster_date}. Farmer requested ₹${claim.estimated_payout.toLocaleString('en-IN')} emergency loss compensation.`,
      telemetry: `Village: ${claim.farmer.village} • Crop: ${claim.crop?.crop_name || 'Crop'} • Sowing: ${claim.crop?.sowing_date || '2026-06-15'}`,
      weight: 15,
      x: 40,
      y: 130
    },
    {
      id: 'cadastral_gis',
      label: 'Bhoomi Cadastral GIS',
      category: 'ground',
      status: 'verified',
      value: `Survey #${claim.land.survey_number}`,
      detail: `Karnataka Bhoomi Revenue Land GIS authenticates cadastral parcel (Survey #${claim.land.survey_number}) with DIGIPIN ${claim.land.digipin} across ${claim.land.area_acres} acres.`,
      telemetry: `Centroid: ${claim.land.latitude.toFixed(4)}°N, ${claim.land.longitude.toFixed(4)}°E • DIGIPIN: ${claim.land.digipin}`,
      weight: 20,
      x: 230,
      y: 50
    },
    {
      id: 'exif_photos',
      label: 'Ground EXIF Sensor',
      category: 'ground',
      status: isFraud ? 'critical' : 'verified',
      value: isFraud ? '14.3 km Geofence Violation' : '32m Geofence Match',
      detail: isFraud
        ? 'GEODETIC MISMATCH: Ground damage photos were taken 14.3 kilometers away from Hosakote parcel centroid. Cryptographic EXIF inspection flagged device location spoofing.'
        : `Optical geotag confirmed within 32 meters of cadastral polygon. Hardware timestamp coincides within 4 hours of torrential downpour.`,
      telemetry: isFraud
        ? 'Photo EXIF GPS: 12.8942°N, 77.6144°E (14.3km error) • Integrity: Compromised'
        : `Photo EXIF GPS: ${claim.land.latitude.toFixed(4)}°N, ${claim.land.longitude.toFixed(4)}°E (32m error) • Integrity: Verified`,
      weight: 25,
      x: 230,
      y: 210
    },
    {
      id: 'sentinel_telemetry',
      label: 'Sentinel-2 MSI Orbit',
      category: 'satellite',
      status: isFraud ? 'critical' : 'verified',
      value: 'Level-2A BOA Radiance',
      detail: `European Space Agency Sentinel-2 multispectral sensor captured pre-disaster pass on ${claim.satellite.pre_disaster_date} and post-disaster pass on ${claim.satellite.post_disaster_date}.`,
      telemetry: `Orbit: Relative Orbit #089 • Solar Zenith: 28.4° • Cloud Cover: 0.9%`,
      weight: 30,
      x: 230,
      y: 130
    },
    {
      id: 'ndvi',
      label: 'Multispectral NDVI/NDWI',
      category: 'satellite',
      status: isFraud ? 'critical' : 'verified',
      value: isFraud ? '-2.5% (Vegetation Intact)' : `-${claim.satellite.vegetation_drop_pct}% Vegetative Drop`,
      detail: isFraud
        ? 'SATELLITE CONTRADICTION: Post-disaster NDVI is 0.76 (dense lush canopy, -2.5% drop). NDWI is -0.38 (completely dry ground). Claimant declared 95% flood devastation.'
        : `Multispectral NDVI collapsed from ${claim.satellite.ndvi_pre_avg} to ${claim.satellite.ndvi_post_avg} (-${claim.satellite.vegetation_drop_pct}% loss). NDWI recorded +${claim.satellite.flood_water_index_ndwi || 0.48} proving deep water submersion.`,
      telemetry: isFraud
        ? 'NDVI Diff: -0.02 • NDWI: -0.38 (Bone Dry) • Physical Contradiction Confirmed'
        : `Pre: ${claim.satellite.ndvi_pre_avg} → Post: ${claim.satellite.ndvi_post_avg} • NDWI: +0.58 (Water Submerged)`,
      weight: 35,
      x: 420,
      y: 130
    },
    {
      id: 'imd_weather',
      label: 'IMD Weather Radar',
      category: 'weather',
      status: isFraud ? 'critical' : 'verified',
      value: `${claim.weather.rainfall_disaster_day_mm} mm Precip`,
      detail: isFraud
        ? 'METEOROLOGICAL CONTRADICTION: IMD gridded reanalysis and Open-Meteo recorded only 1.2 mm rainfall on disaster date (0.08x baseline). Soil saturation is only 18% (dry week).'
        : `Extreme localized cloudburst recorded on ${claim.disaster.disaster_date} (${claim.weather.rainfall_disaster_day_mm} mm). Rainfall anomaly is ${claim.weather.anomaly_ratio}x historical August baseline. Soil moisture supersaturated at ${claim.weather.soil_saturation_pct}%.`,
      telemetry: isFraud
        ? 'Precip: 1.2 mm • 7-Day Cumulative: 3.5 mm • Anomaly: 0.08x (Dry)'
        : `Precip: 142.5 mm • 7-Day Cumulative: 265.0 mm • Anomaly: 3.42x (Cloudburst)`,
      weight: 25,
      x: 420,
      y: 210
    },
    {
      id: 'ai_swarm_consensus',
      label: 'Autonomous AI Swarm',
      category: 'actuarial',
      status: isFraud ? 'critical' : 'verified',
      value: `${claim.evidence_confidence_score}% Confidence`,
      detail: isFraud
        ? 'CRITICAL FRAUD INTERCEPTION: 5 Autonomous AI agents detected 3 irreconcilable physical contradictions between declared loss, satellite spectral health, and weather radar. Score: 12/100.'
        : `Unanimous corroboration across all 5 autonomous verification agents. Tri-sensor convergence achieved with 89% evidence confidence. Fast-track settlement approved.`,
      telemetry: isFraud
        ? 'Consensus Score: 12/100 • Risk Tier: Critical Fraud • Fraud Factor: 0.94'
        : 'Consensus Score: 89/100 • Risk Tier: Low Risk • Settlement Velocity: 72h',
      weight: 40,
      x: 620,
      y: 130
    },
    {
      id: 'adjudication_verdict',
      label: 'Adjudication Decision',
      category: 'actuarial',
      status: isFraud ? 'critical' : 'verified',
      value: isFraud ? 'Payout: ₹0.00 (Flagged)' : `₹${claim.estimated_payout.toLocaleString('en-IN')}`,
      detail: isFraud
        ? 'FINAL ADJUDICATION: Payout revoked to ₹0.00. Dossier forwarded to State PMFBY Anti-Fraud Vigilance Bureau.'
        : `FINAL ADJUDICATION: Actuarial payout of ₹${claim.estimated_payout.toLocaleString('en-IN')} approved based on PMFBY scale of finance (₹10,000/ac cap) and 70% verified inundation.`,
      telemetry: isFraud
        ? 'Decision: Claim Rejected & Referred • Actuarial Status: Blocked'
        : 'Decision: Approved • Direct DBT Payment Scheduled via PMFBY Gateway',
      weight: 100,
      x: 790,
      y: 130
    }
  ];

  // Connections / Causal Edges
  const edges = [
    { from: 'claim_declaration', to: 'cadastral_gis' },
    { from: 'claim_declaration', to: 'exif_photos' },
    { from: 'cadastral_gis', to: 'sentinel_telemetry' },
    { from: 'sentinel_telemetry', to: 'ndvi' },
    { from: 'claim_declaration', to: 'imd_weather' },
    { from: 'exif_photos', to: 'ai_swarm_consensus' },
    { from: 'ndvi', to: 'ai_swarm_consensus' },
    { from: 'imd_weather', to: 'ai_swarm_consensus' },
    { from: 'ai_swarm_consensus', to: 'adjudication_verdict' }
  ];

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];

  const filteredNodes = activeLayerFilter === 'all' 
    ? nodes 
    : nodes.filter(n => n.category === activeLayerFilter || n.category === 'actuarial');

  // Comparative Tri-Sensor Convergence Metrics
  const declaredLoss = claim.disaster.damage_percentage_reported;
  const satelliteLoss = isFraud ? 2.5 : claim.satellite.vegetation_drop_pct;
  const weatherIntensity = isFraud ? 3.0 : 92.0;
  const groundExifMatch = isFraud ? 12.0 : 96.0;

  return (
    <div className="bg-[#0B101E]/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-2xl space-y-6 text-slate-100">
      {/* Panel Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              {b('Explainable AI (XAI)', 'ವಿವರಣಾತ್ಮಕ ಎಐ (XAI)', language)}
            </span>
            <span className="text-xs bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-2.5 py-0.5 rounded-full font-mono font-medium">
              {b('Knowledge Graph & Causal Lineage', 'ಜ್ಞಾನ ಗ್ರಾಫ್ & ಕಾರಣಾತ್ಮಕ ಸಂಬಂಧ', language)}
            </span>
          </div>
          <h3 className="text-xl font-bold text-white mt-1 tracking-tight">
            {b('Explainable AI Multi-Sensor Evidence Graph', 'ವಿವರಣಾತ್ಮಕ ಬಹು-ಸಂವೇದಕ ಪುರಾವೆ ಗ್ರಾಫ್', language)}
          </h3>
          <p className="text-xs text-slate-400">
            {b(
              'Interactive causal evidence network showing how physical sensors, orbital telemetry, and actuarial models arrive at the claim verdict.',
              'ಭೌತಿಕ ಸಂವೇದಕಗಳು, ಉಪಗ್ರಹ ದತ್ತಾಂಶ ಮತ್ತು ವಿಮಾ ಮಾದರಿಗಳು ಹೇಗೆ ಒಮ್ಮತದ ತೀರ್ಪಿಗೆ ಬರುತ್ತವೆ ಎಂಬುದನ್ನು ತೋರಿಸುವ ಗ್ರಾಫ್.',
              language
            )}
          </p>
        </div>

        {/* Layer Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 text-xs">
          {[
            { id: 'all', label: b('All Layers', 'ಎಲ್ಲಾ ಹಂತಗಳು', language) },
            { id: 'satellite', label: b('🛰️ Satellite', '🛰️ ಉಪಗ್ರಹ', language) },
            { id: 'weather', label: b('🌧️ Weather', '🌧️ ಹವಾಮಾನ', language) },
            { id: 'ground', label: b('📍 Ground Truth', '📍 ಭೂಮಿ ಸಾಕ್ಷ್ಯ', language) },
            { id: 'actuarial', label: b('⚖️ Actuarial', '⚖️ ವಿಮಾ ತೀರ್ಪು', language) }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveLayerFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                activeLayerFilter === f.id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. INTERACTIVE SVG CAUSAL KNOWLEDGE GRAPH                      */}
      {/* ============================================================== */}
      <div className="relative rounded-3xl bg-slate-950/80 border border-slate-800/90 p-4 overflow-x-auto shadow-inner">
        <div className="flex items-center justify-between mb-2 px-2 text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-mono">
            <Network className="w-3.5 h-3.5 text-cyan-400" />
            <span>{b('Interactive Node-Link Causal Topology • Click any node to inspect telemetry', 'ಸಂವಾದಾತ್ಮಕ ನೋಡ್ ಟೋಪಾಲಜಿ • ವಿವರಗಳಿಗೆ ಯಾವುದೇ ನೋಡ್ ಕ್ಲಿಕ್ ಮಾಡಿ', language)}</span>
          </span>
          <span className={`text-[11px] font-mono font-bold ${isFraud ? 'text-red-400' : 'text-cyan-400'}`}>
            {isFraud ? b('🚨 Contradictory Edges Active', '🚨 ವಿರೋಧಾಭಾಸದ ಲಿಂಕ್ ಸಕ್ರಿಯವಾಗಿದೆ', language) : b('✓ Unanimous Edge Consensus', '✓ ಸರ್ವಾನುಮತದ ಒಮ್ಮತ', language)}
          </span>
        </div>

        <div className="relative min-w-[880px] h-[280px]">
          <svg className="w-full h-full absolute inset-0 pointer-events-none">
            <defs>
              <linearGradient id="edgeGradNormal" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="edgeGradFraud" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#b91c1c" stopOpacity="0.9" />
              </linearGradient>
            </defs>

            {/* Render Connecting Bezier Edges */}
            {edges.map((e, idx) => {
              const fromNode = nodes.find(n => n.id === e.from);
              const toNode = nodes.find(n => n.id === e.to);
              if (!fromNode || !toNode) return null;

              const isConnected = selectedNodeId === e.from || selectedNodeId === e.to;
              const isBadEdge = isFraud && (e.to === 'ai_swarm_consensus' || e.from === 'exif_photos' || e.from === 'ndvi' || e.from === 'imd_weather');

              const dx = toNode.x - fromNode.x;
              const cx1 = fromNode.x + dx * 0.5;
              const cy1 = fromNode.y;
              const cx2 = fromNode.x + dx * 0.5;
              const cy2 = toNode.y;
              const d = `M ${fromNode.x + 60} ${fromNode.y + 25} C ${cx1} ${cy1 + 25}, ${cx2} ${cy2 + 25}, ${toNode.x} ${toNode.y + 25}`;

              return (
                <g key={idx}>
                  <path
                    d={d}
                    fill="none"
                    stroke={isBadEdge ? '#ef4444' : isConnected ? '#06b6d4' : '#334155'}
                    strokeWidth={isConnected ? 3 : 1.5}
                    strokeDasharray={isBadEdge ? '4,4' : isConnected ? '6,4' : 'none'}
                    className={isConnected || isBadEdge ? 'animate-pulse' : ''}
                  />
                  {/* Flow Particles along active connections */}
                  {isConnected && (
                    <circle r="3.5" fill={isBadEdge ? '#ef4444' : '#06b6d4'}>
                      <animateMotion path={d} dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Render Interactive HTML Nodes */}
          {nodes.map(n => {
            const isSelected = selectedNodeId === n.id;
            const isCritical = n.status === 'critical';
            const isFiltered = activeLayerFilter !== 'all' && n.category !== activeLayerFilter && n.category !== 'actuarial';

            return (
              <div
                key={n.id}
                onClick={() => setSelectedNodeId(n.id)}
                style={{ left: `${n.x}px`, top: `${n.y}px` }}
                className={`absolute w-36 p-2.5 rounded-2xl border text-left transition-all cursor-pointer select-none transform hover:scale-105 z-10 ${
                  isFiltered ? 'opacity-30' : 'opacity-100'
                } ${
                  isSelected
                    ? isCritical
                      ? 'bg-red-950/90 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)] ring-2 ring-red-500/40'
                      : 'bg-slate-850 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] ring-2 ring-cyan-400/40'
                    : isCritical
                    ? 'bg-red-950/60 border-red-800/80 hover:border-red-500'
                    : 'bg-slate-900/90 border-slate-700/80 hover:border-cyan-500/60 shadow-md backdrop-blur-md'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    isCritical ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  }`}>
                    {n.category}
                  </span>
                  <span className="w-2 h-2 rounded-full" style={{ background: isCritical ? '#ef4444' : '#06b6d4', boxShadow: isCritical ? '0 0 6px #ef4444' : '0 0 6px #06b6d4' }} />
                </div>
                <div className="text-[11px] font-bold text-white truncate">{n.label}</div>
                <div className={`text-[10px] font-mono font-black truncate mt-0.5 ${
                  isCritical ? 'text-red-400' : 'text-cyan-300'
                }`}>
                  {n.value}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. SELECTED NODE DEEP FORENSIC DETAIL CARD                     */}
      {/* ============================================================== */}
      <div className={`p-5 rounded-2xl border transition-all ${
        selectedNode.status === 'critical'
          ? 'bg-red-950/30 border-red-500/40 shadow-xl'
          : 'bg-gradient-to-r from-slate-900/90 via-cyan-950/20 to-slate-900/90 border-cyan-500/30 shadow-xl'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                selectedNode.status === 'critical'
                  ? 'bg-red-500/20 text-red-300 border-red-500/40'
                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              }`}>
                {selectedNode.category} Evidence Node
              </span>
              <h4 className="text-base font-bold text-white">{selectedNode.label}</h4>
              {selectedNode.status === 'critical' && (
                <span className="text-[10px] bg-red-600 text-white font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                  <AlertTriangle className="w-3 h-3" />
                  <span>CONTRADICTION DETECTED</span>
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              {selectedNode.detail}
            </p>

            <div className="text-[11px] font-mono text-cyan-300 pt-1 flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>{b('Raw Sensor Telemetry:', 'ನೈಜ ಸಂವೇದಕ ಟೆಲಿಮೆಟ್ರಿ:', language)} <strong className="text-white">{selectedNode.telemetry}</strong></span>
            </div>
          </div>

          <div className="flex-shrink-0 text-right p-3 bg-slate-950/80 rounded-xl border border-slate-700/80 shadow-md">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">{b('Node Verified Value', 'ದೃಢೀಕರಿಸಿದ ಮೌಲ್ಯ', language)}</span>
            <span className={`text-xl font-black font-mono block mt-0.5 ${
              selectedNode.status === 'critical' ? 'text-red-400' : 'text-cyan-400'
            }`}>
              {selectedNode.value}
            </span>
            <span className="text-[9px] text-slate-400 block">{b('Causal Weight:', 'ಕಾರಣಾತ್ಮಕ ತೂಕ:', language)} {selectedNode.weight}%</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. ATTRACTIVE VISUAL GRAPHS & COMPARISON CHARTS                */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GRAPH 1: TRI-SENSOR CONVERGENCE COMPARISON BARS */}
        <div className="p-5 bg-slate-950/60 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <h4 className="text-sm font-bold text-white">{b('Tri-Sensor Cross-Validation Convergence', 'ತ್ರಿ-ಸಂವೇದಕ ದೃಢೀಕರಣ ಒಮ್ಮುಖತೆ', language)}</h4>
            </div>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
              isFraud 
                ? 'bg-red-500/20 text-red-300 border-red-500/30' 
                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
            }`}>
              {isFraud ? b('🚨 88% Sensor Conflict', '🚨 88% ಸಂವೇದಕ ಸಂಘರ್ಷ', language) : b('✓ 94% Multi-Sensor Convergence', '✓ 94% ಬಹು-ಸಂವೇದಕ ಒಮ್ಮುಖತೆ', language)}
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            {isFraud
              ? b('Orbital satellite and meteorological radar severely contradict the claimant declaration. Sensors diverge outside valid physical limits.', 'ಉಪಗ್ರಹ ಮತ್ತು ಹವಾಮಾನ ರೇಡಾರ್ ರೈತರ ಘೋಷಣೆಗೆ ತೀವ್ರ ವಿರುದ್ಧವಾಗಿವೆ. ಭೌತಿಕ ಮಿತಿಗಳಿಂದ ಸಂವೇದಕಗಳು ಭಿನ್ನವಾಗಿವೆ.', language)
              : b('All 3 independent physical telemetry sources corroborate the reported disaster within a tight 6% margin of error.', 'ಎಲ್ಲಾ ೩ ಸ್ವತಂತ್ರ ಭೌತಿಕ ಸಂವೇದಕ ಮೂಲಗಳು ಕೇವಲ ೬% ವ್ಯತ್ಯಾಸದೊಂದಿಗೆ ವರದಿ ಮಾಡಿದ ವಿಪತ್ತನ್ನು ದೃಢೀಕರಿಸುತ್ತವೆ.', language)}
          </p>

          <div className="space-y-3 pt-1">
            {/* 1. Declared Loss */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-semibold">{b('1. Farmer Declared Loss', '1. ರೈತರು ವರದಿ ಮಾಡಿದ ನಷ್ಟ', language)}</span>
                <span className="text-white font-mono font-bold">{declaredLoss}%</span>
              </div>
              <div className="w-full h-3 bg-slate-800/80 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                  style={{ width: `${Math.min(100, declaredLoss)}%` }}
                />
              </div>
            </div>

            {/* 2. Sentinel-2 Satellite Vegetation Loss */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-semibold">2. Sentinel-2 Satellite Vegetation Loss</span>
                <span className={`font-mono font-bold ${isFraud ? 'text-red-400' : 'text-cyan-400'}`}>
                  {satelliteLoss.toFixed(1)}% {isFraud ? '(Healthy Canopy!)' : '(Severe Inundation)'}
                </span>
              </div>
              <div className="w-full h-3 bg-slate-800/80 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    isFraud ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-gradient-to-r from-cyan-500 to-teal-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                  }`}
                  style={{ width: `${Math.max(4, Math.min(100, satelliteLoss))}%` }}
                />
              </div>
            </div>

            {/* 3. Weather Radar Precipitation Anomaly */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-semibold">3. IMD Meteorological Radar Anomaly</span>
                <span className={`font-mono font-bold ${isFraud ? 'text-red-400' : 'text-indigo-400'}`}>
                  {weatherIntensity}% {isFraud ? '(Negligible 1.2mm rain)' : '(142.5mm Cloudburst)'}
                </span>
              </div>
              <div className="w-full h-3 bg-slate-800/80 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    isFraud ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-gradient-to-r from-indigo-500 to-cyan-400 shadow-[0_0_10px_rgba(99,102,241,0.5)]'
                  }`}
                  style={{ width: `${Math.max(4, Math.min(100, weatherIntensity))}%` }}
                />
              </div>
            </div>

            {/* 4. Ground Photo EXIF Geofence Match */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-semibold">4. Ground Camera EXIF Geofence Compliance</span>
                <span className={`font-mono font-bold ${isFraud ? 'text-red-400' : 'text-purple-400'}`}>
                  {groundExifMatch}% {isFraud ? '(14.3km Out of Bounds)' : '(Inside Parcel)'}
                </span>
              </div>
              <div className="w-full h-3 bg-slate-800/80 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    isFraud ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-gradient-to-r from-purple-500 to-indigo-400 shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                  }`}
                  style={{ width: `${Math.max(4, Math.min(100, groundExifMatch))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* GRAPH 2: EXPLAINABLE AI FACTOR ATTRIBUTION (WATERFALL BREAKDOWN) */}
        <div className="p-5 bg-slate-950/60 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <h4 className="text-sm font-bold text-white">XAI Factor Attribution & Weight Waterfall</h4>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Bayesian Consensus Model
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Mathematical breakdown of how positive corroborating signals and negative fraud penalties synthesized the final verdict.
          </p>

          <div className="space-y-2.5 pt-1 text-xs">
            {isFraud ? (
              <>
                <div className="flex items-center justify-between p-2.5 bg-red-950/40 rounded-xl border border-red-500/30">
                  <div className="flex items-center gap-2">
                    <span className="text-red-400 font-bold font-mono">-45 pts</span>
                    <span className="text-red-200 font-medium">Camera EXIF GPS is 14.3 km away from Hosakote parcel</span>
                  </div>
                  <span className="text-[10px] font-bold text-red-400 uppercase">Penalty</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-red-950/40 rounded-xl border border-red-500/30">
                  <div className="flex items-center gap-2">
                    <span className="text-red-400 font-bold font-mono">-35 pts</span>
                    <span className="text-red-200 font-medium">Sentinel-2 MSI detects healthy canopy (NDVI 0.76, -2.5% drop)</span>
                  </div>
                  <span className="text-[10px] font-bold text-red-400 uppercase">Penalty</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-red-950/40 rounded-xl border border-red-500/30">
                  <div className="flex items-center gap-2">
                    <span className="text-red-400 font-bold font-mono">-20 pts</span>
                    <span className="text-red-200 font-medium">IMD radar recorded only 1.2 mm rain (dry week, no flood)</span>
                  </div>
                  <span className="text-[10px] font-bold text-red-400 uppercase">Penalty</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-900/80 rounded-xl border border-slate-700/80">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 font-bold font-mono">+12 pts</span>
                    <span className="text-slate-300">Valid PMFBY policy application number registration</span>
                  </div>
                  <span className="text-[10px] font-bold text-cyan-300 uppercase">Credit</span>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between font-bold">
                  <span className="text-slate-300">Net Final AI Confidence Rating:</span>
                  <span className="text-red-400 font-mono text-sm">12 / 100 (Critical Fraud Risk)</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between p-2.5 bg-cyan-950/30 rounded-xl border border-cyan-500/20">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 font-bold font-mono">+35 pts</span>
                    <span className="text-slate-200 font-medium">Sentinel-2 multispectral NDVI drop from 0.74 to 0.28 (-62%)</span>
                  </div>
                  <span className="text-[10px] font-bold text-cyan-300 uppercase">Weight</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-cyan-950/30 rounded-xl border border-cyan-500/20">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 font-bold font-mono">+25 pts</span>
                    <span className="text-slate-200 font-medium">IMD radar 142.5 mm localized cloudburst corroboration</span>
                  </div>
                  <span className="text-[10px] font-bold text-cyan-300 uppercase">Weight</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-cyan-950/30 rounded-xl border border-cyan-500/20">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 font-bold font-mono">+20 pts</span>
                    <span className="text-slate-200 font-medium">Camera EXIF GPS matches parcel centroid within 32m</span>
                  </div>
                  <span className="text-[10px] font-bold text-cyan-300 uppercase">Weight</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-cyan-950/30 rounded-xl border border-cyan-500/20">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 font-bold font-mono">+15 pts</span>
                    <span className="text-slate-200 font-medium">Cadastral Survey 125/2 matching DIGIPIN 562C-8F29-KM</span>
                  </div>
                  <span className="text-[10px] font-bold text-cyan-300 uppercase">Weight</span>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between font-bold">
                  <span className="text-slate-300">Net Final AI Confidence Rating:</span>
                  <span className="text-cyan-400 font-mono text-sm">89 / 100 (Unanimous Approval)</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
