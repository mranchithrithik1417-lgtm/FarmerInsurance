import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Search, Filter, CheckCircle2, XCircle, 
  AlertCircle, FileText, Download, User, MapPin, 
  Satellite, CloudRain, Check, MessageSquare
} from 'lucide-react';
import { api, Claim } from '../services/api';

export const OfficerDashboardPage: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Review Action Form
  const [decision, setDecision] = useState<'approved' | 'rejected' | 'additional_evidence_required'>('approved');
  const [remarks, setRemarks] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    loadClaims();
  }, [filterStatus]);

  const loadClaims = async () => {
    setLoading(true);
    try {
      const data = await api.getClaims(filterStatus || undefined);
      setClaims(data);
      if (data.length > 0 && !selectedClaim) {
        setSelectedClaim(data[0]);
      } else if (selectedClaim) {
        const updated = data.find(c => c.id === selectedClaim.id);
        if (updated) setSelectedClaim(updated);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load claims');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaim) return;
    if (!remarks.trim()) {
      setErrorMsg('Please enter review remarks explaining your assessment rationale.');
      return;
    }
    setSubmittingReview(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await api.reviewClaim(selectedClaim.id, {
        decision,
        remarks,
        evidence_requested: decision === 'additional_evidence_required' ? remarks : undefined
      });
      setSuccessMsg(`Review decision '${decision}' successfully recorded for ${selectedClaim.claim_number}`);
      setRemarks('');
      await loadClaims();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
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

  const filteredClaims = claims.filter(c => 
    c.claim_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.farmer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.field_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.digipin.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-forest-800" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900">
              Agricultural Officer Audit Console
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review multi-spectral Sentinel-2 remote sensing indices, precipitation anomalies, and EXIF ground evidence.
          </p>
        </div>

        {/* Filter and Search */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search claim, farmer, DIGIPIN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-forest-600 focus:outline-none w-56 font-mono"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="under_review">Under Review</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="additional_evidence_required">Evidence Requested</option>
          </select>
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

      {/* Main Grid: Queue and Detailed Audit View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Claim Queue */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Assigned Claims Queue ({filteredClaims.length})
            </span>
          </div>

          <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
            {filteredClaims.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedClaim(c)}
                className={`p-4 rounded-2xl border transition cursor-pointer ${
                  selectedClaim?.id === c.id
                    ? 'border-forest-700 bg-forest-50/60 ring-2 ring-forest-600/20'
                    : 'border-slate-200 hover:border-forest-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-navy-900">{c.claim_number}</span>
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

                <div className="text-xs font-bold text-slate-800 mt-1">
                  {c.farmer_name} • {c.crop} ({c.area_acres} Acres)
                </div>

                <div className="text-[11px] text-slate-500 flex items-center justify-between mt-1">
                  <span>{c.disaster_type} ({c.incident_date})</span>
                  <span className="font-mono font-semibold text-forest-800">{c.digipin_display}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Detailed Deep-Dive & Review Form */}
        <div className="lg:col-span-7 space-y-6">
          {selectedClaim ? (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              {/* Dossier Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Claim Dossier Audit
                  </span>
                  <h3 className="text-xl font-extrabold text-navy-900">{selectedClaim.claim_number}</h3>
                  <div className="text-xs text-slate-600 mt-0.5">
                    Farmer: <b className="text-slate-800">{selectedClaim.farmer_name}</b> • Farm: {selectedClaim.farm_name}
                  </div>
                </div>

                <button
                  onClick={() => handleDownloadPdf(selectedClaim.id)}
                  className="px-4 py-2 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs transition flex items-center gap-1.5 shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Dossier PDF</span>
                </button>
              </div>

              {/* DIGIPIN Addressing Card */}
              <div className="p-4 bg-forest-50/80 rounded-2xl border border-forest-200/70 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-forest-800 text-white rounded-xl">
                    <MapPin className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-forest-700 uppercase tracking-wider block">
                      India Post DIGIPIN (Centroid Reference)
                    </span>
                    <div className="text-lg font-black font-mono text-navy-900">{selectedClaim.digipin_display}</div>
                  </div>
                </div>

                <div className="text-right text-xs font-mono text-slate-600">
                  <div>{selectedClaim.centroid_lat.toFixed(5)}°N, {selectedClaim.centroid_lon.toFixed(5)}°E</div>
                  <div className="text-[10px] text-slate-400">EPSG:4326 (~3.8m level-10)</div>
                </div>
              </div>

              {/* Multi-spectral Sentinel-2 Analysis */}
              {selectedClaim.satellite && (
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Satellite className="w-4 h-4 text-forest-700" />
                      <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                        Copernicus Sentinel-2 Surface Reflectance (NDVI)
                      </h4>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">MSI Level-2A</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-semibold text-slate-400 block">Pre-Disaster NDVI</span>
                      <span className="text-lg font-extrabold text-emerald-700 font-mono">
                        {selectedClaim.satellite.pre_ndvi}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{selectedClaim.satellite.pre_disaster_date}</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-semibold text-slate-400 block">Post-Disaster NDVI</span>
                      <span className="text-lg font-extrabold text-navy-900 font-mono">
                        {selectedClaim.satellite.post_ndvi}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{selectedClaim.satellite.post_disaster_date}</span>
                    </div>

                    <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                      <span className="text-[10px] font-semibold text-rose-600 block">Chlorophyll Drop</span>
                      <span className="text-lg font-extrabold text-rose-700 font-mono">
                        {selectedClaim.satellite.ndvi_change_pct}%
                      </span>
                      <span className="text-[10px] text-rose-600 block mt-0.5">Deficit Delta</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Open-Meteo Weather Corroboration */}
              {selectedClaim.weather && (
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CloudRain className="w-4 h-4 text-navy-700" />
                      <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                        Historical Precipitation Observations (Open-Meteo)
                      </h4>
                    </div>
                    <span className="text-[10px] text-slate-400">10-Year Reanalysis</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-xl">
                      <span className="text-[10px] text-slate-400 block">Cumulative Rain</span>
                      <span className="text-base font-extrabold text-navy-900 font-mono">
                        {selectedClaim.weather.total_rainfall_mm} mm
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl">
                      <span className="text-[10px] text-slate-400 block">Peak 24h Rain</span>
                      <span className="text-base font-extrabold text-navy-900 font-mono">
                        {selectedClaim.weather.max_daily_rainfall_mm} mm
                      </span>
                    </div>
                    <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200">
                      <span className="text-[10px] text-amber-800 block">Anomaly vs Mean</span>
                      <span className="text-base font-extrabold text-amber-900 font-mono">
                        +{selectedClaim.weather.rainfall_anomaly_pct}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Ground Evidence & EXIF Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                  Ground Photo Evidence & EXIF Geotag Verification
                </h4>
                {selectedClaim.evidence.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-400 italic text-center">
                    No photographs attached
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedClaim.evidence.map((ev) => (
                      <div key={ev.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-800">{ev.filename}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            SHA-256: {ev.sha256_hash}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ev.exif_lat ? 'bg-emerald-100 text-forest-800' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {ev.exif_lat ? `EXIF Valid (${ev.distance_to_field_m}m)` : 'No EXIF GPS'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Officer Decision Form */}
              <form onSubmit={handleSubmitReview} className="pt-4 border-t border-slate-100 space-y-4">
                <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                  Record Officer Audit Decision
                </h4>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setDecision('approved')}
                    className={`py-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                      decision === 'approved'
                        ? 'bg-emerald-50 border-emerald-600 text-forest-900 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Approve Assessment</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecision('additional_evidence_required')}
                    className={`py-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                      decision === 'additional_evidence_required'
                        ? 'bg-amber-50 border-amber-600 text-amber-900 ring-2 ring-amber-500/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Request Evidence</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecision('rejected')}
                    className={`py-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                      decision === 'rejected'
                        ? 'bg-rose-50 border-rose-600 text-rose-900 ring-2 ring-rose-500/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Reject Claim</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Official Review Remarks & Assessment Rationale
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide specific justification referencing Sentinel-2 NDVI drop, weather anomalies, or photo coordinates..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-forest-600 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-6 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs shadow transition"
                  >
                    {submittingReview ? "Recording Review..." : "Submit Official Decision"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-xs text-slate-400">
              Select a claim from the queue to conduct official evidence audit
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
