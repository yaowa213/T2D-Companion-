
import React, { useEffect, useState } from 'react';
import { getDevBypassEnabled, setDevBypassEnabled, clearDevState } from '../../lib/devFlags';

interface DevOptionsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DevOptionsSheet: React.FC<DevOptionsSheetProps> = ({ isOpen, onClose }) => {
  const [bypassActive, setBypassActive] = useState(getDevBypassEnabled());
  const [toast, setToast] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleToggleBypass = () => {
    const newValue = !bypassActive;
    setDevBypassEnabled(newValue);
    setBypassActive(newValue);
    setToast(newValue ? "Developer bypass enabled" : "Developer bypass disabled");
    setTimeout(() => setToast(null), 2000);
    
    // In many cases, we reload to ensure all guards (RequireAuth, etc.) 
    // re-evaluate based on the new flag immediately.
    setTimeout(() => window.location.reload(), 500);
  };

  return (
    <div 
      className="fixed inset-0 z-[2147483647] flex items-end justify-center bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200 pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dev-title"
    >
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-t-[32px] p-6 pb-12 shadow-2xl border-t border-red-100 dark:border-red-900/30 animate-in slide-in-from-bottom duration-300">
        <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6" />
        
        <header className="mb-8">
          <h2 id="dev-title" className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
            Developer Options
          </h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
            Only available in development builds.
          </p>
        </header>

        {bypassActive && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-center space-x-3 text-red-600 dark:text-red-400 animate-pulse">
            <span className="text-xl">⚠️</span>
            <span className="text-[10px] font-black uppercase">Auth & Legal bypassed (DEV).</span>
          </div>
        )}

        <div className="space-y-6">
          <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
            <div className="space-y-1 pr-4">
              <label htmlFor="bypass-toggle" className="font-bold text-sm block">Bypass Auth & Legal</label>
              <p className="text-[10px] text-gray-400 leading-tight">
                For local testing only. Never enabled in production.
              </p>
            </div>
            <button
              id="bypass-toggle"
              onClick={handleToggleBypass}
              className={`w-14 h-8 rounded-full relative transition-all duration-300 ${bypassActive ? 'bg-red-500 shadow-inner' : 'bg-gray-200 dark:bg-gray-700'}`}
              aria-checked={bypassActive}
              role="switch"
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${bypassActive ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          <div className="space-y-3">
            <button 
              onClick={clearDevState}
              className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-2xl text-xs active:scale-95 transition-all"
            >
              Clear local dev state
            </button>
            <button 
              onClick={onClose}
              className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-2xl text-xs shadow-lg active:scale-95 transition-all"
            >
              Close
            </button>
          </div>
        </div>

        {/* Aria-live region for toggle feedback */}
        <div aria-live="polite" className="sr-only">
          {toast}
        </div>
      </div>
    </div>
  );
};
