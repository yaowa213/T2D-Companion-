
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navigation } from './Navigation';
import { OfflineBanner } from './OfflineBanner';

export const Layout: React.FC = () => {
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('home')) return 'Daily Overview';
    if (path.includes('checkin')) return 'Daily Log';
    if (path.includes('reminders')) return 'Reminders';
    if (path.includes('visit-prep')) return 'Visit Prep';
    if (path.includes('settings')) return 'Settings';
    return 'T2D Companion';
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-white dark:bg-gray-900 shadow-xl relative transition-colors duration-300">
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-blue-600 focus:text-white"
      >
        Skip to content
      </a>

      <OfflineBanner />

      <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">{getPageTitle()}</h1>
        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">
          JD
        </div>
      </header>

      <main id="main-content" className="flex-1 overflow-y-auto pb-24 px-4 py-6" aria-live="polite">
        <Outlet />
      </main>

      <Navigation />
    </div>
  );
};
