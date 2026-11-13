import React, { useState } from 'react';
import { Sprout, ShieldCheck, User, Key, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

interface AuthPageProps {
  mode: 'login' | 'register';
  onAuthSuccess: (user: any) => void;
  onSwitchMode: (mode: 'login' | 'register') => void;
}

export const AuthPages: React.FC<AuthPageProps> = ({ mode, onAuthSuccess, onSwitchMode }) => {
  const [email, setEmail] = useState<string>('farmer.ramesh@kisanclaim.gov.in');
  const [password, setPassword] = useState<string>('Farmer@12345');
  const [fullName, setFullName] = useState<string>('Ramesh Kumar H.K.');
  const [role, setRole] = useState<'farmer' | 'officer'>('farmer');
  const [phone, setPhone] = useState<string>('+91 98450 11223');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleDemoPreset = (presetRole: 'farmer' | 'officer' | 'admin') => {
    if (presetRole === 'farmer') {
      setEmail('farmer.ramesh@kisanclaim.gov.in');
      setPassword('Farmer@12345');
      setFullName('Ramesh Kumar H.K.');
      setRole('farmer');
    } else if (presetRole === 'officer') {
      setEmail('officer.mandya@kisanclaim.gov.in');
      setPassword('Officer@12345');
      setFullName('Anand Gowda, KAS');
      setRole('officer');
    } else {
      setEmail('admin@kisanclaim.gov.in');
      setPassword('Admin@12345');
      setFullName('Dr. Sunita Sharma');
      setRole('officer'); // admin
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      if (mode === 'login') {
        const res = await api.login({ email, password });
        api.setToken(res.access_token);
        onAuthSuccess(res.user);
      } else {
        const res = await api.register({
          email,
          password,
          full_name: fullName,
          phone,
          role
        });
        api.setToken(res.access_token);
        onAuthSuccess(res.user);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-forest-800 text-white flex items-center justify-center mx-auto shadow-md">
            <Sprout className="w-7 h-7 text-emerald-300" />
          </div>
          <h2 className="text-2xl font-extrabold text-navy-900">
            {mode === 'login' ? 'Sign In to KisanClaim' : 'Register Farmer Account'}
          </h2>
          <p className="text-xs text-slate-500">
            {mode === 'login'
              ? 'Access field maps, official DIGIPIN references, and claim dossiers'
              : 'Join the national evidence-based crop damage assessment network'}
          </p>
        </div>

        {/* Quick Demo Role Fillers */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
            Demo Evaluation Accounts:
          </span>
          <div className="flex items-center justify-center gap-1.5">
            <button
              type="button"
              onClick={() => handleDemoPreset('farmer')}
              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white border border-slate-200 hover:border-forest-600 text-slate-700 transition"
            >
              Farmer Ramesh
            </button>
            <button
              type="button"
              onClick={() => handleDemoPreset('officer')}
              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white border border-slate-200 hover:border-forest-600 text-slate-700 transition"
            >
              Officer Anand
            </button>
            <button
              type="button"
              onClick={() => handleDemoPreset('admin')}
              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white border border-slate-200 hover:border-forest-600 text-slate-700 transition"
            >
              Admin Sunita
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-forest-600 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-forest-600 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-forest-600 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-sm shadow transition flex items-center justify-center gap-1.5"
          >
            <span>{loading ? "Authenticating..." : mode === 'login' ? "Sign In" : "Create Account"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          {mode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => onSwitchMode('register')}
                className="font-bold text-forest-800 hover:underline"
              >
                Register as Farmer
              </button>
            </span>
          ) : (
            <span>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => onSwitchMode('login')}
                className="font-bold text-forest-800 hover:underline"
              >
                Sign In
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
