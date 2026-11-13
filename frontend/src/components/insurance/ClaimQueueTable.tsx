import React, { useState } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { Claim } from '../../types';
import { b, t } from '../../utils/translations';

interface Props {
  claims: Claim[];
  language?: 'en' | 'kn';
  onSelectClaim: (claim: Claim) => void;
}

export const ClaimQueueTable: React.FC<Props> = ({ claims, language = 'en', onSelectClaim }) => {
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
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Additional Evidence Required':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Rejected':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
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
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
      {/* Table Filters Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={b('Search claim ID, farmer, survey #, or district...', 'ಕ್ಲೇಮ್ ಐಡಿ, ರೈತರು, ಸರ್ವೆ ಸಂಖ್ಯೆ ಅಥವಾ ಜಿಲ್ಲೆ ಹುಡುಕಿ...', language)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-700 font-medium outline-none focus:bg-white"
          >
            <option value="all">{b('All Statuses', 'ಎಲ್ಲಾ ಸ್ಥಿತಿಗಳು', language)}</option>
            <option value="Pending Review">{b('Pending Review', 'ಪರಿಶೀಲನೆ ಬಾಕಿ', language)}</option>
            <option value="Approved">{b('Approved', 'ಅನುಮೋದಿತ', language)}</option>
            <option value="Additional Evidence Required">{b('Additional Evidence Required', 'ಹೆಚ್ಚುವರಿ ಪುರಾವೆ ಅಗತ್ಯ', language)}</option>
            <option value="Payment Scheduled">{b('Payment Scheduled', 'ಪಾವತಿ ನಿಗದಿಯಾಗಿದೆ', language)}</option>
            <option value="Rejected">{b('Rejected', 'ತಿರಸ್ಕರಿಸಲಾಗಿದೆ', language)}</option>
          </select>

          <select
            value={cropFilter}
            onChange={e => setCropFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-700 font-medium outline-none focus:bg-white"
          >
            <option value="all">{b('All Crops', 'ಎಲ್ಲಾ ಬೆಳೆಗಳು', language)}</option>
            <option value="Ragi">Ragi (ರಾಗಿ)</option>
            <option value="Paddy">Paddy (ಭತ್ತ)</option>
            <option value="Sugarcane">Sugarcane (ಕಬ್ಬು)</option>
            <option value="Onion">Onion (ಈರುಳ್ಳಿ)</option>
            <option value="Cotton">Cotton (ಹತ್ತಿ)</option>
            <option value="Wheat">Wheat (ಗೋಧಿ)</option>
          </select>

          <select
            value={disasterFilter}
            onChange={e => setDisasterFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-700 font-medium outline-none focus:bg-white"
          >
            <option value="all">{b('All Disasters', 'ಎಲ್ಲಾ ವಿಪತ್ತುಗಳು', language)}</option>
            <option value="Flood">{b('Flood', 'ಪ್ರವಾಹ', language)}</option>
            <option value="Heavy rainfall">{b('Heavy rainfall', 'ಭಾರಿ ಮಳೆ', language)}</option>
            <option value="Drought">{b('Drought', 'ಬರಗಾಲ', language)}</option>
            <option value="Hailstorm">{b('Hailstorm', 'ಆಲಿಕಲ್ಲು ಮಳೆ', language)}</option>
            <option value="Pest attack">{b('Pest attack', 'ಕೀಟ ಬಾಧೆ', language)}</option>
          </select>
        </div>
      </div>

      {/* Claims Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">{b('Claim ID', 'ಕ್ಲೇಮ್ ಸಂಖ್ಯೆ', language)}</th>
              <th className="py-3 px-4">{b('Farmer & Village', 'ರೈತರು & ಗ್ರಾಮ', language)}</th>
              <th className="py-3 px-4">{b('Crop', 'ಬೆಳೆ', language)}</th>
              <th className="py-3 px-4">{b('Peril & Date', 'ವಿಪತ್ತು & ದಿನಾಂಕ', language)}</th>
              <th className="py-3 px-4">{b('Severity', 'ತೀವ್ರತೆ', language)}</th>
              <th className="py-3 px-4">{b('Confidence', 'ವಿಶ್ವಾಸಾರ್ಹತೆ', language)}</th>
              <th className="py-3 px-4">{b('Estimated Payout', 'ಅಂದಾಜು ಪರಿಹಾರ', language)}</th>
              <th className="py-3 px-4">{b('Adjudication Status', 'ವಿಮಾ ತೀರ್ಪು ಸ್ಥಿತಿ', language)}</th>
              <th className="py-3 px-4 text-right">{b('Review Action', 'ಕ್ರಮ', language)}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white font-medium">
            {filteredClaims.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-500">
                  {b('No insurance claims match the selected criteria.', 'ಯಾವುದೇ ಕ್ಲೇಮ್‌ಗಳು ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ.', language)}
                </td>
              </tr>
            ) : (
              filteredClaims.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => onSelectClaim(c)}
                  className="hover:bg-slate-50 transition cursor-pointer group"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                    {c.claim_number}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 group-hover:text-blue-700 transition">
                      {c.farmer.name}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {c.farmer.village}, {c.farmer.district}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-800">
                    {c.crop.crop_name}
                    <span className="text-[10px] text-slate-500 block font-normal">({c.land.area_acres} ac)</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-slate-900 font-semibold">{c.disaster.disaster_type}</span>
                    <span className="text-[10px] text-slate-500 block">{c.disaster.disaster_date}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={getSeverityBadge(c.estimated_damage_severity)}>
                      {c.estimated_damage_severity} ({c.disaster.damage_percentage_reported}%)
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    <span className="text-emerald-700 font-bold">{c.evidence_confidence_score}%</span>
                    <span className="text-[10px] text-slate-500 block font-sans">{c.indicative_likelihood_score}% likelihood</span>
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
                    <button className="px-3 py-1.5 bg-slate-100 group-hover:bg-blue-600 text-slate-700 group-hover:text-white rounded-lg transition font-semibold text-xs flex items-center gap-1 ml-auto">
                      <span>{b('Inspect', 'ಪರಿಶೀಲಿಸಿ', language)}</span>
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
