import React from 'react';
import { Sprout, ShieldCheck, MapPin, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-900 text-slate-300 border-t border-navy-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-forest-700 flex items-center justify-center text-white">
                <Sprout className="w-5 h-5 text-emerald-300" />
              </div>
              <span className="text-lg font-extrabold text-white">KisanClaim</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Open Evidence Agricultural Crop Damage Assessment, Sentinel-2 Multi-spectral NDVI, and India Post DIGIPIN Referencing Platform.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Core Technologies</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>• India Post DIGIPIN (IIT Hyderabad & NRSC/ISRO)</li>
              <li>• Copernicus Sentinel-2 Level-2A MSI</li>
              <li>• Open-Meteo Historical Weather Archive</li>
              <li>• Cryptographic SHA-256 Chain of Custody</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Geographic Addressing</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              DIGIPIN EPSG:4326 Bounding Box [2.5°N - 38.5°N, 63.5°E - 99.5°E]. 
              Recursive 10-level hierarchical spatial subdivision yielding ~3.8m × 3.8m ground resolution.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Statutory Framework</h4>
            <div className="p-3 bg-navy-800/80 rounded-xl border border-navy-700 text-[11px] text-slate-300 leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mb-1" />
              KisanClaim is an evidence-support platform. It does not provide automated insurance claim approval or substitute authorized field assessments.
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-navy-800 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            &copy; {new Date().getFullYear()} KisanClaim Agricultural Technologies. Developed for national hackathon demonstration.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Dak Bhawan Reference: 39J49LL8T4</span>
            <span>•</span>
            <span className="text-emerald-400">v1.0.0 Production Release</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
