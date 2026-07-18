
import React from 'react';
import { getBypassActive } from '../lib/devBypass';

export const DevBypassBanner: React.FC = () => {
  if (!getBypassActive()) return null;

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-[9999] bg-red-600 text-white text-[10px] font-bold py-1 px-4 text-center shadow-md pointer-events-none"
      role="status"
    >
      DEVELOPER MODE: AUTH & LEGAL BYPASSED
    </div>
  );
};
