
import React, { useState, useEffect } from 'react';

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div 
      role="alert" 
      aria-live="assertive"
      className="bg-amber-100 border-b border-amber-200 text-amber-800 px-4 py-2 text-sm text-center font-medium sticky top-0 z-50 animate-pulse"
    >
      Working offline. Changes will sync when you're back online.
    </div>
  );
};
