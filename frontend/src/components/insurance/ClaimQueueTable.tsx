import React, { useState } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { Claim } from '../../types';

interface Props {
  claims: Claim[];
  onSelectClaim: (claim: Claim) => void;
}

export const ClaimQueueTable: React.FC<Props> = ({ claims, onSelectClaim }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cropFilter, setCropFilter] = useState<string>('all');
  const [disasterFilter, setDisasterFilter] = useState<string>('all');

  const filteredClaims = claims.filter(c => {
    if (statusFilter !== 'all' && c.current_status.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (cropFilter !== 'all' && c.crop.crop_name.toLowerCase() !== cropFilter.toLowerCase()) return false;
    if (disasterFilter !== 'all' && c.disaster.disaster_type.toLowerCase() !== disasterFilter.toLowerCase()) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      const match = (
        c.claim_number.toLowerCase().includes(s) ||
        c.farmer.name.toLowerCase().includes(s) ||
        c.farmer.district.toLowerCase().includes(s) ||
        c.land.survey_number.toLowerCase().includes(s) ||
        c.crop.crop_name.toLowerCase().includes(s)
      );
      if (!match) return false;
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Payment Scheduled':
      case 'Paid':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'Additional Evidence Required':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Rejected':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-blue-50 text-blue-800 border-blue-200';
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'Severe':
        return 'text-red-700 font-bold';
      case 'High':
        return 'text-amber-700 font-semibold';
      case 'Moderate':
        return 'text-yellow-700 font-medium';
      default:
        return 'text-emerald-700 font-medium';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm">
      {/* Table Filters Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search claim ID, farmer, survey #, or district..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition shadow-xs"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none focus:border-emerald-600 focus:bg-white transition cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Approved">Approved</option>
            <option value="Additional Evidence Required">Additional Evidence Required</option>
            <option value="Payment Scheduled">Payment Scheduled</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={cropFilter}
            onChange={e => setCropFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none focus:border-emerald-600 focus:bg-white transition cursor-pointer"
          >
            <option value="all">All Crops</option>
            <option value="Ragi">Ragi</option>
            <option value="Paddy">Paddy</option>
            <option value="Sugarcane">Sugarcane</option>
            <option value="Onion">Onion</option>
            <option value="Cotton">Cotton</option>
            <option value="Wheat">Wheat</option>
          </select>

          <select
            value={disasterFilter}
            onChange={e => setDisasterFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none focus:border-emerald-600 focus:bg-white transition cursor-pointer"
          >
            <option value="all">All Disasters</option>
            <option value="Flood">Flood</option>
            <option value="Heavy rainfall">Heavy rainfall</option>
            <option value="Drought">Drought</option>
            <option value="Hailstorm">Hailstorm</option>
            <option value="Pest attack">Pest attack</option>
          </select>
        </div>
      </div>

      {/* Claims Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Claim ID</th>
              <th className="py-3 px-4">Farmer & Village</th>
              <th className="py-3 px-4">Crop</th>
              <th className="py-3 px-4">Peril & Date</th>
              <th className="py-3 px-4">Severity</th>
              <th className="py-3 px-4">Confidence</th>
              <th className="py-3 px-4">Estimated Payout</th>
              <th className="py-3 px-4">Adjudication Status</th>
              <th className="py-3 px-4 text-right">Review Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white font-medium">
            {filteredClaims.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-500">
                  No insurance claims match the selected criteria.
                </td>
              </tr>
            ) : (
              filteredClaims.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => onSelectClaim(c)}
                  className="hover:bg-emerald-50/40 transition cursor-pointer group"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">
                    {c.claim_number}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition">
                      {c.farmer.name}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {c.farmer.village}, {c.farmer.district}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">
                    {c.crop.crop_name}
                    <span className="text-[10px] text-slate-400 block font-normal">({c.land.area_acres} ac)</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-slate-900 font-semibold">{c.disaster.disaster_type}</span>
                    <span className="text-[10px] text-slate-500 block font-normal">{c.disaster.disaster_date}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={getSeverityBadge(c.estimated_damage_severity)}>
                      {c.estimated_damage_severity} ({c.disaster.damage_percentage_reported}%)
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    <span className="text-emerald-700 font-bold">{c.evidence_confidence_score}%</span>
                    <span className="text-[10px] text-slate-400 block font-normal">{c.indicative_likelihood_score}% likelihood</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                    ₹{c.estimated_payout.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusBadge(c.current_status)}`}>
                      {c.current_status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="px-3 py-1.5 bg-slate-100 group-hover:bg-emerald-700 text-slate-700 group-hover:text-white rounded-lg transition font-semibold text-xs flex items-center gap-1 ml-auto cursor-pointer shadow-xs">
                      <span>Inspect</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
