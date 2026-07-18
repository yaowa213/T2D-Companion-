
import React from 'react';
import { isDevBuild } from '../../lib/devFlags';
import { DevFloatingButton } from './DevFloatingButton';
import { DevOverlayErrorBoundary } from './DevOverlayErrorBoundary';

export const DevOverlayRoot: React.FC = () => {
  // Hard check for dev build
  if (!isDevBuild()) return null;

  return (
    <DevOverlayErrorBoundary>
      {/* Absolute Stacking Context for Dev Tools */}
      <div id="dev-overlay-container" className="fixed inset-0 pointer-events-none z-[2147483647]">
        
        {/* Environment Watermark - confirms we are actually in DEV mode */}
        <div 
          className="absolute top-0 left-0 bg-red-600/10 text-red-600/40 text-[9px] font-mono px-2 py-0.5 select-none uppercase tracking-tighter"
          aria-hidden="true"
        >
          Dev Mode • T2D Companion
        </div>

        {/* Floating Button and Modal (Internal components restore pointer events) */}
        <div className="absolute inset-0 pointer-events-none">
          <DevFloatingButton />
        </div>
      </div>
    </DevOverlayErrorBoundary>
  );
};
