import React, { useState } from 'react';
import { Sprout, Bell, Globe, PhoneCall, HelpCircle, ArrowRightLeft, LogOut } from 'lucide-react';
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
  const initial = userName.trim().charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-md">
      <div className="px-4 sm:px-5 py-2.5 flex items-center justify-between gap-3 flex-wrap">
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 text-white shadow-md shadow-emerald-700/20">
            <Sprout className="w-5 h-5" />
          </div>
          <div className="leading-tight">
            <div className="text-xl font-black tracking-tight text-slate-900">
              Kisan<span className="text-emerald-700">Claim</span>
            </div>
            <div className="text-[11px] text-slate-500 hidden md:block font-medium">
              {role === 'farmer'
                ? (language === 'kn' ? 'ರೈತರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್' : 'Farmer dashboard')
                : (language === 'kn' ? 'ವಿಮಾ ಕಂಪನಿ ಕನ್ಸೋಲ್' : 'Insurance console')}
            </div>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Switch portal */}
          <button
            onClick={() => onSwitchRole(role === 'farmer' ? 'insurance' : 'farmer')}
            className="px-3 py-1.5 bg-slate-50 text-slate-700 rounded-2xl text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            title={`Switch to ${role === 'farmer' ? 'Insurance Console' : 'Farmer Dashboard'}`}
          >
            <ArrowRightLeft className="w-4 h-4 text-emerald-700" />
            <span className="hidden sm:inline">{role === 'farmer' ? 'Insurance view' : 'Farmer view'}</span>
          </button>

          {/* Support helpline */}
          <a
            href="tel:9019715931"
            className="px-3.5 py-1.5 bg-emerald-700 text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap"
            title={role === 'insurance' ? 'Direct Insurance & Claims Support Helpline' : 'Direct Farmer Customer Support Helpline'}
          >
            <PhoneCall className="w-4 h-4" />
            <span className="font-mono tracking-tight font-bold">9019715931</span>
          </a>

          {/* Help */}
          <button
            type="button"
            onClick={() => setShowSupportModal(true)}
            className="px-3 py-1.5 bg-slate-50 text-slate-700 rounded-2xl text-xs font-bold cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap"
            title={role === 'insurance' ? 'Claims & Adjudicator Helpdesk' : 'Customer Support Help & FAQs'}
          >
            <HelpCircle className="w-4 h-4 text-emerald-700" />
            <span className="hidden lg:inline">Help</span>
          </button>

          {/* Language */}
          <button
            onClick={() => onLanguageChange(language === 'en' ? 'kn' : 'en')}
            className="px-3 py-1.5 bg-slate-50 text-slate-700 rounded-2xl text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            title="Switch Language (English / ಕನ್ನಡ)"
          >
            <Globe className="w-4 h-4 text-emerald-700" />
            <span>{language === 'en' ? 'ಕನ್ನಡ' : 'English'}</span>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="p-2.5 bg-slate-50 text-slate-600 rounded-2xl relative cursor-pointer"
              title="Real-Time Claim Alerts"
              aria-label="Claim alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

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
                      <div key={n.id} className="p-3 text-xs">
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

          {/* Profile + sign out */}
          <div className="flex items-center gap-2 pl-1.5 pr-1.5 py-1 rounded-full bg-slate-50">
            <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center text-sm font-bold">
              {initial}
            </div>
            <div className="leading-tight hidden xl:block pr-1">
              <div className="text-xs font-bold text-slate-900 whitespace-nowrap">{userName}</div>
              <div className="text-[10px] font-mono text-slate-500 whitespace-nowrap">{userIdentifier}</div>
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-red-700 rounded-full cursor-pointer"
              title="Sign Out"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

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
