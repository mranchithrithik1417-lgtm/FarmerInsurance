import React from 'react';
import { Sprout, Compass, ShieldCheck, Satellite, Layers, FileCheck, CheckCircle2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16 space-y-12">
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-forest-700 bg-forest-100 px-3 py-1 rounded-full">
          About KisanClaim
        </span>
        <h1 className="text-4xl font-extrabold text-navy-900 tracking-tight">
          Pioneering Evidence-Based Agriculture
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          KisanClaim was engineered to transform how smallholder farmers document, georeference, and substantiate agricultural crop loss caused by catastrophic natural disasters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-xl bg-forest-800 text-white flex items-center justify-center">
            <Compass className="w-5 h-5 text-emerald-300" />
          </div>
          <h3 className="text-lg font-bold text-navy-900">Official India Post DIGIPIN Referencing</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            In collaboration with specifications from the Department of Posts, IIT Hyderabad, and NRSC/ISRO, 
            KisanClaim calculates strict 10-level hierarchical 4×4 spatial geocodes (~3.8m ground resolution) for agricultural parcel centroids, 
            providing a permanent national reference independent of land records.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-xl bg-navy-800 text-white flex items-center justify-center">
            <Satellite className="w-5 h-5 text-emerald-300" />
          </div>
          <h3 className="text-lg font-bold text-navy-900">Copernicus Sentinel-2 Remote Sensing</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Using European Space Agency (ESA) multi-spectral surface reflectance bands (NIR Band 8 at 842nm and Red Band 4 at 665nm), 
            we quantify vegetation chlorophyll loss (NDVI) before and after disasters without subjective human estimates.
          </p>
        </div>
      </div>
    </div>
  );
};

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16 space-y-12">
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-forest-700 bg-forest-100 px-3 py-1 rounded-full">
          Methodology & Architecture
        </span>
        <h1 className="text-4xl font-extrabold text-navy-900 tracking-tight">
          Scientific Damage Assessment Pipeline
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          How KisanClaim links farmer smartphone geotags, multi-spectral satellite imagery, and meteorological reanalysis into an audit-ready dossier.
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-navy-900">1. Spatial Georeferencing (DIGIPIN Standard)</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            The national bounding box [2.5°N - 38.5°N, 63.5°E - 99.5°E] (EPSG:4326) is recursively partitioned across 10 levels 
            using the official India Post 16-character matrix. On vertical boundaries, the eastward cell is assigned; on horizontal boundaries, 
            the northward cell is assigned. The resulting 10-character string (e.g. 39J49LL8T4) pins the property centroid to within ~3.8 meters.
          </p>
        </div>

        <div className="space-y-3 pt-6 border-t border-slate-100">
          <h3 className="text-lg font-bold text-navy-900">2. Remote Sensing NDVI Deficit</h3>
          <div className="p-4 bg-slate-50 rounded-2xl font-mono text-xs text-slate-700 border border-slate-200">
            NDVI = (NIR_Band8 - RED_Band4) / (NIR_Band8 + RED_Band4)
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Vegetation stress is evaluated by comparing clear-sky pre-incident surface reflectance against post-incident imagery. 
            Severe drops exceeding 28% indicate significant physical disturbance or inundation.
          </p>
        </div>

        <div className="space-y-3 pt-6 border-t border-slate-100">
          <h3 className="text-lg font-bold text-navy-900">3. Climatological Corroboration & EXIF Audit</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            High-resolution weather observations from the Open-Meteo Historical Archive quantify rainfall anomaly percentages 
            against 10-year climatological normals, corroborating flood or drought claims. Smartphone photos are checked for embedded EXIF GPS tags.
          </p>
        </div>
      </div>
    </div>
  );
};
