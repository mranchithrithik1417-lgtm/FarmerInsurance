import React, { useState, useEffect } from 'react';
import { 
  Sprout, Plus, MapPin, FileText, Upload, CheckCircle2, 
  AlertTriangle, Download, Eye, Clock, Layers, ArrowRight, Check
} from 'lucide-react';
import { api, Farm, Field, Claim } from '../services/api';
import { MapPolygonDrawer } from '../components/MapPolygonDrawer';

export const FarmerDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'new-field' | 'new-claim'>('overview');
  const [farms, setFarms] = useState<Farm[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // New Field State
  const [fieldFarmId, setFieldFarmId] = useState<number>(0);
  const [fieldName, setFieldName] = useState<string>('');
  const [fieldCrop, setFieldCrop] = useState<string>('Paddy');
  const [fieldVariety, setFieldVariety] = useState<string>('Jyothi (BPT-5204)');
  const [fieldSowingDate, setFieldSowingDate] = useState<string>('2026-07-15');
  const [fieldSeason, setFieldSeason] = useState<string>('Kharif');
  const [polygonCoords, setPolygonCoords] = useState<[number, number][]>([]);
  const [fieldDigipin, setFieldDigipin] = useState<string>('');
  const [fieldArea, setFieldArea] = useState<number>(1.0);

  // New Claim Wizard State
  const [claimFieldId, setClaimFieldId] = useState<number>(0);
  const [claimDisasterType, setClaimDisasterType] = useState<string>('Flood');
  const [claimDate, setClaimDate] = useState<string>('2026-10-24');
  const [claimDuration, setClaimDuration] = useState<number>(3);
  const [claimDescription, setClaimDescription] = useState<string>('');
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [submittingClaim, setSubmittingClaim] = useState<boolean>(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [farmsData, fieldsData, claimsData] = await Promise.all([
        api.getFarms(),
        api.getFields(),
        api.getClaims()
      ]);
      setFarms(farmsData);
      setFields(fieldsData);
      setClaims(claimsData);
      if (farmsData.length > 0) setFieldFarmId(farmsData[0].id);
      if (fieldsData.length > 0) setClaimFieldId(fieldsData[0].id);
      if (claimsData.length > 0 && !selectedClaim) setSelectedClaim(claimsData[0]);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load dashboard records');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (polygonCoords.length < 3) {
      setErrorMsg('Please draw at least 3 points on the interactive map to form a field polygon');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await api.createField({
        farm_id: fieldFarmId,
        name: fieldName || `${fieldCrop} Parcel`,
        crop: fieldCrop,
        crop_variety: fieldVariety,
        sowing_date: fieldSowingDate,
        cultivation_season: fieldSeason,
        polygon_geojson: JSON.stringify(polygonCoords)
      });
      setSuccessMsg(`Field successfully registered with official DIGIPIN ${fieldDigipin}!`);
      loadDashboardData();
      setActiveTab('overview');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to register field');
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setSelectedPhoto(f);
      setPhotoPreview(URL.createObjectURL(f));
    }
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimFieldId) {
      setErrorMsg('Please select an agricultural field');
      return;
    }
    setSubmittingClaim(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const createdClaim = await api.createClaim({
        field_id: claimFieldId,
        disaster_type: claimDisasterType,
        incident_date: claimDate,
        duration_days: claimDuration,
        description: claimDescription
      });

      // Upload evidence photo if provided
      if (selectedPhoto) {
        await api.uploadEvidence(createdClaim.id, selectedPhoto);
      }

      setSuccessMsg(`Claim ${createdClaim.claim_number} submitted! Multi-source satellite and weather analysis synthesized.`);
      setSelectedPhoto(null);
      setPhotoPreview('');
      setClaimDescription('');
      await loadDashboardData();
      setSelectedClaim(createdClaim);
      setActiveTab('overview');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit claim');
    } finally {
      setSubmittingClaim(false);
    }
  };

  const handleDownloadPdf = async (claimId: number) => {
    try {
      const res = await api.generateReport(claimId);
      window.open(res.download_url, '_blank');
    } catch (err: any) {
      alert(err.message || 'Failed to generate PDF report');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900">Farmer Operations Center</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-forest-100 text-forest-800 text-xs font-bold">
              Mandya Agri-Zone
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage agricultural parcels, generate official India Post DIGIPIN references, and track crop damage insurance claims.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('new-field')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'new-field' 
                ? 'bg-forest-800 text-white shadow' 
                : 'bg-forest-50 text-forest-800 hover:bg-forest-100'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Register Field Polygon</span>
          </button>
          <button
            onClick={() => setActiveTab('new-claim')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'new-claim' 
                ? 'bg-forest-800 text-white shadow' 
                : 'bg-forest-800 text-white hover:bg-forest-900 shadow'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Submit Damage Claim</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 text-rose-800 text-xs rounded-2xl border border-rose-200">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-50 text-forest-900 text-xs rounded-2xl border border-emerald-200 font-medium">
          {successMsg}
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Registered Farms</span>
              <div className="text-2xl font-black text-navy-900 mt-1">{farms.length}</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mapped Field Parcels</span>
              <div className="text-2xl font-black text-forest-800 mt-1">{fields.length}</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Damage Claims</span>
              <div className="text-2xl font-black text-navy-900 mt-1">{claims.length}</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Approved / Cleared</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                {claims.filter(c => c.status === 'approved').length}
              </div>
            </div>
          </div>

          {/* Fields with DIGIPIN reference */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-navy-900">Registered Field Parcels & DIGIPIN</h3>
                <p className="text-xs text-slate-500">Each polygon has an independent official DIGIPIN derived at its centroid</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fields.map((fld) => (
                <div key={fld.id} className="p-4 rounded-2xl bg-forest-50/50 border border-forest-100 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-navy-900">{fld.name}</h4>
                      <span className="text-xs text-slate-500">{fld.crop} • {fld.area_acres} Acres</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-forest-800 font-bold text-[10px]">
                      {fld.cultivation_season}
                    </span>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-forest-200/60 flex items-center justify-between">
                    <div>
                      <div className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Official DIGIPIN</div>
                      <div className="text-sm font-black font-mono text-forest-900 tracking-wide">{fld.digipin_display}</div>
                    </div>
                    <div className="text-right text-[10px] text-slate-500 font-mono">
                      {fld.centroid_lat.toFixed(4)}°N<br/>{fld.centroid_lon.toFixed(4)}°E
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Claims List and Deep Dive */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Claims Table */}
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-navy-900">Submitted Damage Claims</h3>
              <div className="space-y-3">
                {claims.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedClaim(c)}
                    className={`p-4 rounded-2xl border transition cursor-pointer ${
                      selectedClaim?.id === c.id 
                        ? 'border-forest-600 bg-forest-50/50 ring-2 ring-forest-500/20' 
                        : 'border-slate-200 hover:border-forest-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono text-slate-500">{c.claim_number}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        c.status === 'approved' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : c.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {c.status}
                      </span>
                    </div>

                    <div className="text-sm font-bold text-navy-900 mt-1">
                      {c.disaster_type} Disaster — {c.field_name}
                    </div>

                    <div className="text-xs text-slate-500 mt-0.5 flex items-center justify-between">
                      <span>Incident: {c.incident_date}</span>
                      <span className="font-mono text-forest-800 font-semibold">{c.digipin_display}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dossier Inspection Panel */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              {selectedClaim ? (
                <>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Dossier Inspection
                      </span>
                      <h4 className="text-base font-bold text-navy-900">{selectedClaim.claim_number}</h4>
                    </div>
                    <button
                      onClick={() => handleDownloadPdf(selectedClaim.id)}
                      className="px-3 py-1.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs transition flex items-center gap-1.5 shadow"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>
                  </div>

                  {/* Satellite Findings */}
                  {selectedClaim.satellite && (
                    <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-2">
                      <div className="text-[10px] uppercase font-bold text-forest-800 tracking-wider">
                        Sentinel-2 Vegetation Deficit (NDVI)
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span>Pre-Incident: <b className="font-mono">{selectedClaim.satellite.pre_ndvi}</b></span>
                        <span>Post-Incident: <b className="font-mono">{selectedClaim.satellite.post_ndvi}</b></span>
                        <span className="text-rose-600 font-bold font-mono">
                          {selectedClaim.satellite.ndvi_change_pct}%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Weather Findings */}
                  {selectedClaim.weather && (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 text-xs">
                      <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                        Historical Weather Anomaly
                      </div>
                      <div className="text-slate-700">
                        Total precipitation: <b className="font-mono">{selectedClaim.weather.total_rainfall_mm} mm</b> ({selectedClaim.weather.rainfall_anomaly_pct > 0 ? '+' : ''}{selectedClaim.weather.rainfall_anomaly_pct}% anomaly)
                      </div>
                    </div>
                  )}

                  {/* Assessment Summary */}
                  {selectedClaim.assessment && (
                    <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 text-xs space-y-1">
                      <div className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
                        Preliminary Assessment Finding
                      </div>
                      <div className="font-bold text-navy-900">{selectedClaim.assessment.finding_category}</div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {selectedClaim.assessment.summary}
                      </p>
                    </div>
                  )}

                  {/* Evidence Photos */}
                  <div>
                    <span className="text-xs font-bold text-slate-700 block mb-2">Ground Photographs & EXIF</span>
                    {selectedClaim.evidence.length === 0 ? (
                      <div className="text-xs text-slate-400 italic">No photographs uploaded yet</div>
                    ) : (
                      <div className="space-y-2">
                        {selectedClaim.evidence.map((ev) => (
                          <div key={ev.id} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs flex items-center justify-between">
                            <div>
                              <div className="font-medium text-slate-800">{ev.filename}</div>
                              <div className="text-[10px] text-slate-400 font-mono">SHA-256: {ev.sha256_hash.slice(0, 12)}...</div>
                            </div>
                            <div className="text-right text-[10px] text-forest-800 font-semibold">
                              {ev.exif_lat ? `GPS: ${ev.distance_to_field_m}m from field` : 'No EXIF GPS'}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-10 text-xs text-slate-400">Select a claim to inspect dossier details</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Register Field Polygon */}
      {activeTab === 'new-field' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-navy-900">Map Field Polygon & Generate DIGIPIN</h2>
            <p className="text-xs text-slate-500 mt-1">
              Click on the satellite-mapped field parcel to define its agricultural boundaries.
            </p>
          </div>

          <form onSubmit={handleCreateField} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Target Farm</label>
                <select
                  value={fieldFarmId}
                  onChange={(e) => setFieldFarmId(parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-forest-600 focus:outline-none"
                >
                  {farms.map((f) => (
                    <option key={f.id} value={f.id}>{f.name} ({f.village})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Field Identifier</label>
                <input
                  type="text"
                  placeholder="e.g. East Paddy Plot"
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-forest-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Cultivated Crop</label>
                <select
                  value={fieldCrop}
                  onChange={(e) => setFieldCrop(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-forest-600 focus:outline-none"
                >
                  <option value="Paddy">Paddy (Rice)</option>
                  <option value="Sugarcane">Sugarcane</option>
                  <option value="Ragi">Ragi (Finger Millet)</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Maize">Maize</option>
                  <option value="Wheat">Wheat</option>
                </select>
              </div>
            </div>

            {/* Interactive Polygon Drawing Map */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Draw Field Boundary Polygon
              </label>
              <MapPolygonDrawer
                onPolygonComplete={(coords, centroid, digipin, acres) => {
                  setPolygonCoords(coords);
                  setFieldDigipin(digipin);
                  setFieldArea(acres);
                }}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className="px-5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-bold rounded-xl bg-forest-800 hover:bg-forest-900 text-white shadow transition"
              >
                Save Field Parcel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab: Submit Crop Damage Claim Wizard */}
      {activeTab === 'new-claim' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 max-w-3xl mx-auto">
          <div>
            <h2 className="text-xl font-bold text-navy-900">Crop Damage Claim Submission Wizard</h2>
            <p className="text-xs text-slate-500 mt-1">
              Submit disaster details and photograph evidence to initiate preliminary satellite and weather synthesis.
            </p>
          </div>

          <form onSubmit={handleSubmitClaim} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  1. Select Affected Field
                </label>
                <select
                  value={claimFieldId}
                  onChange={(e) => setClaimFieldId(parseInt(e.target.value))}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-forest-600 focus:outline-none"
                >
                  {fields.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.crop} - {f.area_acres} Acres) — DIGIPIN: {f.digipin_display}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    2. Disaster Type
                  </label>
                  <select
                    value={claimDisasterType}
                    onChange={(e) => setClaimDisasterType(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-forest-600 focus:outline-none"
                  >
                    <option value="Flood">Flood / Inundation</option>
                    <option value="Drought">Drought</option>
                    <option value="Heavy rainfall">Heavy Rainfall</option>
                    <option value="Hailstorm">Hailstorm</option>
                    <option value="Cyclone">Cyclone</option>
                    <option value="Landslide">Landslide</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Incident Date
                  </label>
                  <input
                    type="date"
                    value={claimDate}
                    onChange={(e) => setClaimDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-forest-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={claimDuration}
                    onChange={(e) => setClaimDuration(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-forest-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Damage Description & Ground Observations
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the nature of damage, water logging height, crop stage, or loss observed..."
                  value={claimDescription}
                  onChange={(e) => setClaimDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-forest-600 focus:outline-none"
                />
              </div>

              {/* Photo Evidence Upload with EXIF parser */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  3. Upload Crop Damage Photograph (JPG, PNG)
                </label>
                <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-center space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-forest-100 file:text-forest-800 hover:file:bg-forest-200"
                  />
                  <p className="text-[11px] text-slate-400">
                    Smartphone photos with embedded GPS EXIF metadata will automatically be validated against the registered field coordinates.
                  </p>
                  {photoPreview && (
                    <div className="mt-3 flex justify-center">
                      <img src={photoPreview} alt="Damage preview" className="h-36 rounded-xl shadow-md border" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className="px-5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingClaim}
                className="px-6 py-2.5 text-xs font-bold rounded-xl bg-forest-800 hover:bg-forest-900 text-white shadow transition"
              >
                {submittingClaim ? "Processing Satellite & Weather Analysis..." : "Submit Claim for Verification"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
