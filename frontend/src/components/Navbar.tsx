import React from 'react';
import { Sprout, Globe, User, LogOut, ShieldCheck, Compass, FileText } from 'lucide-react';
import { translations, Language } from '../i18n/translations';

interface NavbarProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  currentPage: string;
  onNavigate: (page: string) => void;
  currentUser: any;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLang,
  onLanguageChange,
  currentPage,
  onNavigate,
  currentUser,
  onLogout
}) => {
  const t = translations[currentLang];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={() => onNavigate('home')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-forest-800 to-forest-900 flex items-center justify-center text-white shadow-md shadow-forest-900/10 group-hover:scale-105 transition-transform">
            <Sprout className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <div className="text-xl font-extrabold tracking-tight text-forest-900 flex items-center gap-1.5">
              {t.brand}
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-forest-100 text-forest-800 uppercase tracking-widest border border-forest-200">
                PROD
              </span>
            </div>
            <div className="text-[11px] font-medium text-slate-500 tracking-tight">
              {t.tagline}
            </div>
          </div>
        </div>

        {/* Center Nav */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-semibold text-slate-600">
          <button
            onClick={() => onNavigate('home')}
            className={`px-3 py-2 rounded-xl transition ${currentPage === 'home' ? 'text-forest-800 bg-forest-50' : 'hover:text-forest-800 hover:bg-slate-50'}`}
          >
            {t.nav_home}
          </button>
          <button
            onClick={() => onNavigate('digipin')}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition ${currentPage === 'digipin' ? 'text-forest-800 bg-forest-50' : 'hover:text-forest-800 hover:bg-slate-50'}`}
          >
            <Compass className="w-4 h-4 text-forest-700" />
            {t.nav_digipin}
          </button>
          <button
            onClick={() => onNavigate('farmer')}
            className={`px-3 py-2 rounded-xl transition ${currentPage === 'farmer' ? 'text-forest-800 bg-forest-50' : 'hover:text-forest-800 hover:bg-slate-50'}`}
          >
            {t.nav_farmer}
          </button>
          <button
            onClick={() => onNavigate('officer')}
            className={`px-3 py-2 rounded-xl transition ${currentPage === 'officer' ? 'text-forest-800 bg-forest-50' : 'hover:text-forest-800 hover:bg-slate-50'}`}
          >
            {t.nav_officer}
          </button>
          <button
            onClick={() => onNavigate('admin')}
            className={`px-3 py-2 rounded-xl transition ${currentPage === 'admin' ? 'text-forest-800 bg-forest-50' : 'hover:text-forest-800 hover:bg-slate-50'}`}
          >
            {t.nav_admin}
          </button>
          <button
            onClick={() => onNavigate('how')}
            className={`px-3 py-2 rounded-xl transition ${currentPage === 'how' ? 'text-forest-800 bg-forest-50' : 'hover:text-forest-800 hover:bg-slate-50'}`}
          >
            {t.nav_how}
          </button>
        </nav>

        {/* Right Actions: Language Selector + Auth */}
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <div className="relative flex items-center">
            <Globe className="w-4 h-4 text-slate-400 absolute left-2.5 pointer-events-none" />
            <select
              value={currentLang}
              onChange={(e) => onLanguageChange(e.target.value as Language)}
              className="pl-8 pr-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 rounded-xl border border-slate-200 text-slate-700 focus:outline-none cursor-pointer transition"
            >
              <option value="en">English</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
              <option value="hi">हिन्दी (Hindi)</option>
            </select>
          </div>

          {/* User Section */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {currentUser.full_name}
                </div>
                <div className="text-[10px] font-semibold text-forest-700 uppercase tracking-wider">
                  {currentUser.role}
                </div>
              </div>
              <button
                onClick={onLogout}
                className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('login')}
                className="px-4 py-2 text-xs font-bold rounded-xl text-forest-800 hover:bg-forest-50 transition"
              >
                {t.login}
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-forest-800 hover:bg-forest-900 text-white shadow-sm transition"
              >
                {t.register}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
