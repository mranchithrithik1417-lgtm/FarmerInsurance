import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { DigipinExplorerPage } from './pages/DigipinExplorerPage';
import { FarmerDashboardPage } from './pages/FarmerDashboardPage';
import { OfficerDashboardPage } from './pages/OfficerDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AuthPages } from './pages/AuthPages';
import { AboutPage, HowItWorksPage } from './pages/PublicPages';
import { Language } from './i18n/translations';
import { api, User } from './services/api';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if token exists
    const token = api.getToken();
    if (token) {
      api.getMe()
        .then((user) => setCurrentUser(user))
        .catch(() => {
          api.clearToken();
          setCurrentUser(null);
        });
    }
  }, []);

  const handleLogout = () => {
    api.clearToken();
    setCurrentUser(null);
    setCurrentPage('home');
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'officer') {
      setCurrentPage('officer');
    } else if (user.role === 'admin') {
      setCurrentPage('admin');
    } else {
      setCurrentPage('farmer');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-forest-50 text-slate-800">
      <Navbar
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        {currentPage === 'home' && (
          <LandingPage currentLang={currentLang} onNavigate={setCurrentPage} />
        )}
        {currentPage === 'digipin' && <DigipinExplorerPage />}
        {currentPage === 'farmer' && <FarmerDashboardPage />}
        {currentPage === 'officer' && <OfficerDashboardPage />}
        {currentPage === 'admin' && <AdminDashboardPage />}
        {currentPage === 'about' && <AboutPage />}
        {currentPage === 'how' && <HowItWorksPage />}
        {currentPage === 'login' && (
          <AuthPages
            mode="login"
            onAuthSuccess={handleAuthSuccess}
            onSwitchMode={(m) => setCurrentPage(m)}
          />
        )}
        {currentPage === 'register' && (
          <AuthPages
            mode="register"
            onAuthSuccess={handleAuthSuccess}
            onSwitchMode={(m) => setCurrentPage(m)}
          />
        )}
      </main>

      <Footer />
    </div>
  );
};
