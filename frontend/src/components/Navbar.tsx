import React, { useState } from 'react';
import { ShieldCheck, Bell, Globe, Sparkles, CheckCircle2, AlertTriangle, FileText, LogOut, ArrowRightLeft, User, Building2, PhoneCall, HelpCircle } from 'lucide-react';
import { NotificationItem, UserSession } from '../types';
import { CustomerSupportModal } from './common/CustomerSupportModal';

interface Props {
  userSession: UserSession | null;
  onLogout: () => void;
  onSwitchRole: (newRole: 'farmer' | 'insurance') => void;
  language: 'en' | 'kn';
  onLanguageChange: (lang: 'en' | 'kn') => void;
  notifications: NotificationItem[];
}

export const Navbar: React.FC<Props> = ({
  userSession,
  onLogout,
  onSwitchRole,
  language,
  onLanguageChange,
  notifications
}) => {
  const [showNotifs, setShowNotifs] = useState<boolean>(false);
  const [showSupportModal, setShowSupportModal] = useState<boolean>(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const role = userSession?.role || 'farmer';
  const userName = userSession?.user.name || (role === 'farmer' ? 'Ravi Kumar' : 'Ananya Sharma');
  const userIdentifier = role === 'farmer'
    ? (userSession?.user.mobile ? `+91 ${userSession.user.mobile}` : '+91 9876543210')
    : (userSession?.user.company_id || 'AGRI-INS-409');

  return (
    <header className="sticky top-0 z-40 bg-[#0A0F1D]/90 backdrop-blur-xl border-b border-slate-800/80 shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-indigo-600 text-white shadow-[0_0_18px_rgba(6,182,212,0.45)] text-xl font-bold ring-1 ring-cyan-400/40">
            🌾
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-white">
                Kisan<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-300">Claim</span>
              </span>
              <span className="hidden md:inline-block text-[10px] font-extrabold uppercase tracking-wider bg-cyan-950/70 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full font-mono shadow-[0_0_10px_rgba(6,182,212,0.15)]">
                PMFBY Orbit
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block font-medium">
              {language === 'kn'
                ? 'ಉಪಗ್ರಹ ಪುರಾವೆ ಅವಳಿ ಮತ್ತು ಬೆಳೆ ವಿಮಾ ಕ್ಲೇಮ್ ಪರಿಶೀಲನಾ ವೇದಿಕೆ'
                : 'Geospatial Telemetry & Insurance Adjudication Twin'}
            </p>
          </div>
        </div>

        {/* Active Portal Badge & Judge Fast-Switcher */}
        <div className="flex items-center gap-2">
          {role === 'farmer' ? (
            <div className="flex items-center bg-slate-900/90 border border-cyan-500/30 rounded-2xl px-3 py-1.5 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
              <div className="flex items-center gap-2">
                <span className="text-sm">🌾</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">{userName}</span>
                    <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-500/40 px-1.5 py-0.5 rounded font-bold">
                      {userIdentifier}
                    </span>
                  </div>
                  <div className="text-[10px] text-cyan-400 font-semibold hidden lg:block">
                    {language === 'kn' ? 'ರೈತರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ (Farmer Dashboard)' : 'Farmer Portal / ರೈತರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center bg-slate-900/90 border border-indigo-500/30 rounded-2xl px-3 py-1.5 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
              <div className="flex items-center gap-2">
                <span className="text-sm">🏢</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">{userName}</span>
                    <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950/80 border border-indigo-500/40 px-1.5 py-0.5 rounded font-bold">
                      {userIdentifier}
                    </span>
                  </div>
                  <div className="text-[10px] text-indigo-400 font-semibold hidden lg:block">
                    {language === 'kn' ? 'ವಿಮಾ ಕಂಪನಿ ಕನ್ಸೋಲ್ (Insurance Console)' : 'Insurance Console / ವಿಮಾ ಕನ್ಸೋಲ್'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Judge Quick Portal Switcher */}
          <button
            type="button"
            onClick={() => onSwitchRole(role === 'farmer' ? 'insurance' : 'farmer')}
            className="px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 hover:text-white rounded-xl border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            title={`Switch to ${role === 'farmer' ? 'Insurance Console' : 'Farmer Dashboard'}`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">
              {role === 'farmer'
                ? (language === 'kn' ? 'ವಿಮಾದಾರರಿಗೆ ಬದಲಾಯಿಸಿ' : 'Switch to Insurer')
                : (language === 'kn' ? 'ರೈತರಿಗೆ ಬದಲಾಯಿಸಿ' : 'Switch to Farmer')}
            </span>
          </button>

          {/* Customer Support Helpline for Farmers */}
          {role === 'farmer' && (
            <div className="flex items-center gap-1.5 shrink-0">
              <a
                href="tel:9019715931"
                className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.35)] border border-cyan-400/40 transition transform hover:-translate-y-0.5 cursor-pointer shrink-0"
                title="Direct Farmer Customer Support Helpline"
              >
                <PhoneCall className="w-3.5 h-3.5 animate-pulse text-white" />
                <span className="hidden md:inline">{language === 'kn' ? 'ಸಹಾಯವಾಣಿ:' : 'Support:'}</span>
                <span className="font-mono tracking-tight font-extrabold">9019715931</span>
              </a>

              <button
                type="button"
                onClick={() => setShowSupportModal(true)}
                className="px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-cyan-300 hover:text-cyan-200 rounded-xl border border-cyan-500/30 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0"
                title="Customer Support Help & FAQs"
              >
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <span className="hidden lg:inline text-xs font-semibold text-cyan-300">
                  {language === 'kn' ? 'ಸಹಾಯ & FAQ' : 'Help & FAQs'}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Right Controls: Notifications, Language & Sign Out */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <button
            type="button"
            onClick={() => onLanguageChange(language === 'en' ? 'kn' : 'en')}
            className="px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 hover:text-white rounded-xl border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            title="Switch Language (English / ಕನ್ನಡ)"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold">{language === 'en' ? 'ಕನ್ನಡ (KN)' : 'English (EN)'}</span>
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifs(!showNotifs)}
              className="p-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 hover:text-white rounded-xl border border-slate-700 relative transition cursor-pointer"
              title="Real-Time Claim Alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0E1527] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl">
                <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-bold text-white">
                    {language === 'kn' ? 'ಲೈವ್ ಅಧಿಸೂಚನೆಗಳು (Alerts)' : 'Live Telemetry Alerts'}
                  </span>
                  <span className="text-[10px] text-cyan-300 font-mono font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40">
                    {language === 'kn' ? 'ಸಕ್ರಿಯ (Live)' : 'WebSocket Active'}
                  </span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/80">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      {language === 'kn' ? 'ಯಾವುದೇ ಹೊಸ ಅಧಿಸೂಚನೆಗಳಿಲ್ಲ (No notifications)' : 'No notifications received yet.'}
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="p-3 hover:bg-slate-800/50 transition text-xs">
                        <div className="font-bold text-slate-100 flex items-center justify-between">
                          <span>{n.title}</span>
                          <span className="text-[9px] text-cyan-400 font-mono">{n.timestamp.slice(11, 16)}</span>
                        </div>
                        <p className="text-slate-400 mt-1 text-[11px] leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={onLogout}
            className="px-2.5 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-xl border border-rose-800/50 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            title="Sign Out / ನಿರ್ಗಮಿಸಿ"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">
              {language === 'kn' ? 'ನಿರ್ಗಮಿಸಿ (Sign Out)' : 'Sign Out'}
            </span>
          </button>
        </div>
      </div>

      {/* Customer Support Modal */}
      {showSupportModal && (
        <CustomerSupportModal
          isOpen={showSupportModal}
          onClose={() => setShowSupportModal(false)}
          language={language}
          farmerName={userName}
          farmerMobile={userSession?.user?.mobile || '9876543210'}
        />
      )}
    </header>
  );
};
