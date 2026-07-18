
import React, { useState } from 'react';
import { isDevBuild, getDevBypassEnabled } from '../../lib/devFlags';
import { DevOptionsSheet } from './DevOptionsSheet';

export const DevFloatingButton: React.FC = () => {
  if (!isDevBuild()) return null;

  const [isOpen, setIsOpen] = useState(false);
  const isBypassActive = getDevBypassEnabled();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        type="button"
        className="fixed bottom-6 right-6 w-14 h-14 bg-red-600 text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center active:scale-90 transition-all border-4 border-white dark:border-gray-900 pointer-events-auto hover:bg-red-700"
        style={{ zIndex: 2147483647 }}
        aria-label="Developer options"
      >
        <span className="text-xl" role="img" aria-hidden="true">⚙️</span>
        {isBypassActive && (
          <span className="absolute -top-1 -right-1 bg-white text-red-600 text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-sm border border-red-100 uppercase">
            On
          </span>
        )}
      </button>

      <DevOptionsSheet 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
};
