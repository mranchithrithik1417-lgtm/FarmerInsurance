import React from 'react';
import { 
  Sprout, Compass, Satellite, CloudRain, FileCheck2, 
  ShieldAlert, ArrowRight, CheckCircle2, ChevronRight,
  MapPin, Award, Layers
} from 'lucide-react';
import { translations, Language } from '../i18n/translations';

interface LandingPageProps {
  currentLang: Language;
  onNavigate: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ currentLang, onNavigate }) => {
  const t = translations[currentLang];

  return (
    <div className="space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-100 text-forest-900 text-xs font-bold tracking-wide border border-forest-200">
                <Award className="w-4 h-4 text-forest-700" />
                <span>OFFICIAL INDIA POST DIGIPIN & COPERNICUS SENTINEL-2 INTEGRATION</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-navy-900 tracking-tight leading-[1.15]">
                {t.hero_title}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                {t.hero_sub}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onNavigate('farmer')}
                  className="px-7 py-3.5 rounded-2xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-sm shadow-lg shadow-forest-900/15 flex items-center gap-2 transition hover:-translate-y-0.5"
                >
                  <span>{t.btn_start_claim}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onNavigate('digipin')}
                  className="px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-navy-900 font-bold text-sm border border-slate-300 shadow-sm flex items-center gap-2 transition hover:-translate-y-0.5"
                >
                  <Compass className="w-4 h-4 text-forest-700" />
                  <span>{t.btn_explore_digipin}</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-200 grid grid-cols-3 gap-6 text-slate-700">
                <div>
                  <div className="text-2xl font-black text-forest-800 font-mono">10 Levels</div>
                  <div className="text-xs text-slate-500 font-medium">India Post 4×4 Grid</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-navy-800 font-mono">~3.8m × 3.8m</div>
                  <div className="text-xs text-slate-500 font-medium">Level-10 Cell Size</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-forest-800 font-mono">Sentinel-2</div>
                  <div className="text-xs text-slate-500 font-medium">10m Multi-spectral NDVI</div>
                </div>
              </div>
            </div>

            {/* Right Hero Graphic Card */}
            <div className="lg:col-span-5">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xl relative">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Live Assessment Dossier</span>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 bg-slate-100 rounded text-slate-600">CLM-2026-84920</span>
                </div>

                <div className="space-y-4">
                  <div className="p-3.5 bg-forest-50 rounded-2xl border border-forest-100">
                    <div className="text-[10px] uppercase font-bold text-forest-800 tracking-wider">India Post DIGIPIN Reference</div>
                    <div className="text-xl font-black font-mono text-navy-900 tracking-wider mt-0.5">
                      39J 49LL 8T4
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">Dak Bhawan, New Delhi (EPSG:4326)</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Pre-Disaster NDVI</div>
                      <div className="text-base font-extrabold text-emerald-700 font-mono mt-0.5">0.742 (Healthy)</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Post-Disaster NDVI</div>
                      <div className="text-base font-extrabold text-rose-600 font-mono mt-0.5">0.368 (-50.4%)</div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs space-y-1">
                    <div className="font-bold text-amber-900">Corroborated Precipitation Anomaly</div>
                    <div className="text-slate-700">
                      Open-Meteo recorded <span className="font-bold font-mono">164.2 mm</span> (+332% over 10-year mean) coinciding with farmer upload.
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('farmer')}
                    className="w-full py-2.5 rounded-xl bg-navy-800 hover:bg-navy-900 text-white font-bold text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <FileCheck2 className="w-4 h-4" />
                    <span>View Sample Damage Dossier</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (4-Step Pipeline) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-forest-700 bg-forest-100 px-3 py-1 rounded-full">
            Transparent Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-900">
            How KisanClaim Evaluates Damage
          </h2>
          <p className="text-sm text-slate-600">
            A seamless multi-source synthesis uniting farmer ground truth with official satellite remote sensing and weather analytics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-forest-800 text-white flex items-center justify-center font-black text-lg">
              1
            </div>
            <h3 className="text-base font-bold text-navy-900">Field Polygon & DIGIPIN</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Farmer draws field boundary on interactive Leaflet maps. The system calculates exact acreage and derives official 10-character DIGIPIN for the centroid.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-forest-800 text-white flex items-center justify-center font-black text-lg">
              2
            </div>
            <h3 className="text-base font-bold text-navy-900">Ground Evidence & EXIF</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Farmer uploads field damage photographs. System extracts camera metadata, EXIF GPS coordinates, and computes distance to field boundary.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-forest-800 text-white flex items-center justify-center font-black text-lg">
              3
            </div>
            <h3 className="text-base font-bold text-navy-900">Sentinel-2 & Weather</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Retrieves pre/post Sentinel-2 surface reflectance, computes NDVI chlorophyll change, and cross-checks historical rainfall anomalies via Open-Meteo.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-forest-800 text-white flex items-center justify-center font-black text-lg">
              4
            </div>
            <h3 className="text-base font-bold text-navy-900">Verifiable PDF Dossier</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Produces a cryptographically signed assessment report with QR verification and SHA-256 integrity hash for insurance claims support.
            </p>
          </div>
        </div>
      </section>

      {/* DIGIPIN Deep Dive Feature */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-navy-900 text-white rounded-3xl p-8 sm:p-12 overflow-hidden relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-navy-800 px-3 py-1 rounded-full border border-emerald-500/30">
                Official Addressing System
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                India Post DIGIPIN Standard (IIT Hyderabad & NRSC/ISRO)
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                DIGIPIN represents a geographic grid cell (~3.8m × 3.8m at level 10) independent of property boundaries. 
                KisanClaim keeps field polygons and DIGIPIN strictly distinct: the polygon defines the farmer's property, 
                while the DIGIPIN provides the permanent, national geocoding reference.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
                <div className="p-4 bg-navy-800/80 rounded-2xl border border-navy-700">
                  <div className="text-emerald-400 font-bold">16 Permitted Symbols</div>
                  <div className="font-mono text-sm text-white mt-1">2 3 4 5 6 7 8 9 C J K L M P F T</div>
                </div>
                <div className="p-4 bg-navy-800/80 rounded-2xl border border-navy-700">
                  <div className="text-emerald-400 font-bold">Bounding Box (EPSG:4326)</div>
                  <div className="font-mono text-xs text-white mt-1">Lat: 2.5°N - 38.5°N | Lon: 63.5°E - 99.5°E</div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('digipin')}
                  className="px-6 py-3 rounded-xl bg-forest-700 hover:bg-forest-600 text-white font-bold text-xs transition flex items-center gap-2"
                >
                  <span>Launch 10-Level 4×4 Grid Explorer</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="w-72 aspect-square p-4 bg-navy-800 rounded-3xl border border-navy-700 shadow-2xl grid grid-cols-4 gap-2">
                {[
                  'F', 'C', '9', '8',
                  'J', '3', '2', '7',
                  'K', '4', '5', '6',
                  'L', 'M', 'P', 'T'
                ].map((sym, i) => (
                  <div key={i} className="flex items-center justify-center font-mono font-extrabold text-xl rounded-xl bg-navy-900 text-emerald-400 border border-navy-700">
                    {sym}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statutory Disclaimer Alert */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 bg-forest-50 border border-forest-200 rounded-3xl flex items-start gap-4">
          <div className="p-2.5 bg-forest-800 text-white rounded-xl">
            <ShieldAlert className="w-5 h-5 text-emerald-300" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-navy-900">National Agricultural Policy & Evidentiary Disclaimer</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              KisanClaim is an evidence-support and preliminary assessment platform. Satellite remote sensing indices (NDVI) and 
              gridded weather reanalysis provide quantitative empirical corroboration, but do not automatically approve insurance claims 
              or replace official field visits mandated under statutory agricultural schemes.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
