import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Users, Database, Layers, CheckCircle2, 
  Activity, Server, FileText, Search, RefreshCw
} from 'lucide-react';
import { api } from '../services/api';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'logs'>('stats');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData, logsData] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getAdminLogs()
      ]);
      setStats(statsData);
      setUsers(usersData);
      setLogs(logsData);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-navy-800" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900">
              National Platform Administration
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            System health telemetry, user accounts, audit trails, and satellite/weather integration monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${activeTab === 'stats' ? 'bg-navy-800 text-white' : 'bg-slate-100 text-slate-700'}`}
          >
            Telemetry
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${activeTab === 'users' ? 'bg-navy-800 text-white' : 'bg-slate-100 text-slate-700'}`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${activeTab === 'logs' ? 'bg-navy-800 text-white' : 'bg-slate-100 text-slate-700'}`}
          >
            Audit Trail
          </button>
          <button
            onClick={loadAdminData}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tab: Telemetry & Stats */}
      {activeTab === 'stats' && stats && (
        <div className="space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Farmers</span>
              <div className="text-3xl font-black text-forest-800 mt-1">{stats.total_farmers}</div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Agricultural Officers</span>
              <div className="text-3xl font-black text-navy-900 mt-1">{stats.total_officers}</div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Monitored Acreage</span>
              <div className="text-3xl font-black text-forest-800 mt-1">{stats.total_monitored_acres} <span className="text-sm font-semibold text-slate-400">Acres</span></div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Claims</span>
              <div className="text-3xl font-black text-navy-900 mt-1">{stats.total_claims}</div>
            </div>
          </div>

          {/* Integration Status Cards */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-navy-900">Remote Sensing & Geocoding Integrations</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-forest-900">India Post DIGIPIN Engine</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-forest-900 text-[10px] font-bold">ACTIVE</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  {stats.digipin_engine_status}
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-forest-900">Sentinel-2 MSI Pipeline</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-forest-900 text-[10px] font-bold">ACTIVE</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  {stats.satellite_service_status}
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-forest-900">Weather Reanalysis Service</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-forest-900 text-[10px] font-bold">ACTIVE</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  {stats.weather_service_status}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Users Management */}
      {activeTab === 'users' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-navy-900">Registered Platform Users</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Full Name</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Registered On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono font-bold text-slate-500">#{u.id}</td>
                    <td className="p-3 font-bold text-navy-900">{u.full_name}</td>
                    <td className="p-3 font-mono text-slate-600">{u.email}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                        u.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : u.role === 'officer'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-500">{u.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Audit Log Trail */}
      {activeTab === 'logs' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-navy-900">Immutable Audit Trail</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Entity</th>
                  <th className="p-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/50">
                    <td className="p-3 text-slate-500 whitespace-nowrap">{l.timestamp}</td>
                    <td className="p-3 font-bold text-forest-800">{l.action}</td>
                    <td className="p-3 text-navy-800">{l.entity_type} #{l.entity_id}</td>
                    <td className="p-3 text-slate-600">{l.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
