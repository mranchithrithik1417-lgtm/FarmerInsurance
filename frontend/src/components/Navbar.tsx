import React, { useState } from 'react';
import { Bell, Globe, PhoneCall, HelpCircle, ArrowRightLeft, LogOut } from 'lucide-react';
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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 text-white shadow-md shadow-emerald-700/20 text-xl font-bold">
            🌾
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-slate-900">
                Kisan<span className="text-emerald-700">Claim</span>
              </span>
              <span className="hidden md:inline-block text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-sans">
                PMFBY AI Telemetry
              </span>
            </div>
            <p className="text-[10px] text-slate-500 hidden sm:block">
              Evidence Twin & Insurance Claim Verification Platform
            </p>
          </div>
        </div>

        {/* Active Portal Badge & Fast-Switcher */}
        <div className="flex items-center gap-2">
          {role === 'farmer' ? (
            <div className="flex items-center bg-emerald-50/80 border border-emerald-200/90 rounded-2xl px-3 py-1.5 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-sm">🌾</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">{userName}</span>
                    <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100/90 px-1.5 py-0.2 rounded font-semibold">
                      {userIdentifier}
                    </span>
                  </div>
                  <div className="text-[10px] text-emerald-700 hidden lg:block font-medium">
                    {language === 'kn' ? 'ರೈತರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್' : 'Farmer Dashboard (Active)'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center bg-blue-50/80 border border-blue-200/90 rounded-2xl px-3 py-1.5 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-sm">🏢</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">{userName}</span>
                    <span className="text-[10px] font-mono text-blue-800 bg-blue-100/90 px-1.5 py-0.2 rounded font-semibold">
                      {userIdentifier}
                    </span>
                  </div>
                  <div className="text-[10px] text-blue-700 hidden lg:block font-medium">
                    {language === 'kn' ? 'ವಿಮಾ ಕಂಪನಿ ಕನ್ಸೋಲ್' : 'Insurance Console (Active)'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Portal Switcher */}
          <button
            onClick={() => onSwitchRole(role === 'farmer' ? 'insurance' : 'farmer')}
            className="px-2.5 py-1.5 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-xl border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            title={`Switch to ${role === 'farmer' ? 'Insurance Console' : 'Farmer Dashboard'}`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">Switch:</span>
            <span>{role === 'farmer' ? 'Insurance View' : 'Farmer View'}</span>
          </button>

          {/* Customer Support Direct Helpline (Available for both Farmer and Insurance) */}
          <div className="flex items-center gap-1.5">
            <a
              href="tel:9019715931"
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition transform hover:-translate-y-0.5 cursor-pointer shrink-0"
              title={role === 'insurance' ? 'Direct Insurance & Claims Support Helpline' : 'Direct Farmer Customer Support Helpline'}
            >
              <PhoneCall className="w-3.5 h-3.5 animate-pulse text-white" />
              <span className="hidden md:inline">Support:</span>
              <span className="font-mono tracking-tight font-extrabold">9019715931</span>
            </a>

            <button
              type="button"
              onClick={() => setShowSupportModal(true)}
              className="px-2.5 py-1.5 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-xl border border-slate-200 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow-xs"
              title={role === 'insurance' ? 'Claims & Adjudicator Helpdesk' : 'Customer Support Help & FAQs'}
            >
              <HelpCircle className="w-4 h-4 text-emerald-700" />
              <span className="hidden lg:inline text-xs font-semibold text-slate-700">Help & FAQs</span>
            </button>
          </div>
        </div>

        {/* Right Controls: Notifications, Language & Sign Out */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <button
            onClick={() => onLanguageChange(language === 'en' ? 'kn' : 'en')}
            className="px-2.5 py-1.5 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-xl border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            title="Switch Language (English / ಕನ್ನಡ)"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-700" />
            <span>{language === 'en' ? 'ಕನ್ನಡ' : 'English'}</span>
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="p-2 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-800 rounded-xl border border-slate-200 relative transition cursor-pointer shadow-xs"
              title="Real-Time Claim Alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50">
                <div className="p-3 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">Live Push Notifications</span>
                  <span className="text-[10px] text-emerald-800 font-mono font-bold bg-emerald-100 px-2 py-0.5 rounded-full">WebSocket Active</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No notifications received yet.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="p-3 hover:bg-slate-50 transition text-xs">
                        <div className="font-bold text-slate-900 flex items-center justify-between">
                          <span>{n.title}</span>
                          <span className="text-[9px] text-slate-400 font-mono">{n.timestamp.slice(11, 16)}</span>
                        </div>
                        <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sign Out Button */}
          <button
            onClick={onLogout}
            className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl border border-red-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5 text-red-600" />
            <span className="hidden sm:inline">Sign Out</span>
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
          farmerMobile={userSession?.user?.mobile || (role === 'insurance' ? '9019715931' : '9876543210')}
          role={role}
        />
      )}
    </header>
  );
};
