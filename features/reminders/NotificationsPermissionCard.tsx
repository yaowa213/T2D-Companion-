import React, { useState, useEffect } from 'react';
import { notificationEngine } from '../../lib/notifications/engine';
import { assertSafeCopy } from '../../lib/copyGuard';

export const NotificationsPermissionCard: React.FC = () => {
  const [status, setStatus] = useState<string | null>(null);

  const check = async () => {
    const { display } = await notificationEngine.checkPermissions();
    setStatus(display);
  };

  useEffect(() => { check(); }, []);

  const handleRequest = async () => {
    const result = await notificationEngine.requestPermissions();
    setStatus(result.display);
  };

  if (status === 'granted') return null;

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-6 rounded-3xl space-y-4 mb-6">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        </div>
        <h3 className="font-bold text-gray-900 dark:text-white">Stay on track</h3>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
        {status === 'denied' 
          ? assertSafeCopy("Notifications are turned off. You can enable reminders in your phone settings to get help staying on track.")
          : assertSafeCopy("Reminders can help you remember your daily tasks. We will only send gentle notifications at your chosen times.")}
      </p>

      {status !== 'denied' && (
        <div className="flex space-x-3">
           <button 
             onClick={handleRequest}
             className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl shadow-md text-sm"
           >
             Enable reminders
           </button>
           <button 
             className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 font-bold py-3 rounded-xl text-sm"
           >
             Not now
           </button>
        </div>
      )}
    </div>
  );
};
