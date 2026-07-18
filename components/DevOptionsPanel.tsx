
import React, { useState } from 'react';
import { isDev, getBypassActive, setBypassActive, clearDevState } from '../lib/devBypass';

interface DevOptionsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DevOptionsPanel: React.FC<DevOptionsPanelProps> = ({ isOpen, onClose }) => {
  if (!isDev || !isOpen) return null;

  const [active, setActive] = useState(getBypassActive());

  const handleToggle = (val: boolean) => {
    setBypassActive(val);
    setActive(val);
    // Reload to ensure all guards re-evaluate
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-red-200 dark:border-red-900/30">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-red-600 uppercase tracking-tight">Developer Options</h2>
          <button onClick={onClose} className="text-gray-400 p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm">Bypass Auth & Legal</span>
              <button 
                onClick={() => handleToggle(!active)}
                className={`w-12 h-6 rounded-full relative transition-colors ${active ? 'bg-red-500' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${active ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
            <p className="text-[10px] text-gray-400 font-medium">
              Injects a mock user and skips legal gates.
            </p>
          </div>

          <div className="text-center space-y-1">
            <p className="text-xs font-bold text-green-600 uppercase tracking-widest">Developer mode active</p>
            <p className="text-[10px] text-gray-400">Never enabled in production builds</p>
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button 
              onClick={clearDevState}
              className="w-full py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl text-xs active:scale-95 transition-all"
            >
              Clear local dev state
            </button>
            <button 
              onClick={onClose}
              className="w-full py-3 bg-red-600 text-white font-bold rounded-xl text-xs shadow-lg active:scale-95 transition-all"
            >
              Close Panel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
