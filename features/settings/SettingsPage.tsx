
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logger } from '../../lib/logger';
import { useSettings, FontSize } from '../../app/SettingsContext';
import { useAuth } from '../../app/AuthProvider';
import { loadOnboardingDraft } from '../../lib/onboardingStore';
import { syncEngine } from '../../lib/syncEngine';
import { outbox, OutboxItem } from '../../lib/outbox';
import { edgeFunctions } from '../../lib/edgeFunctions';
import { wipeAllUserLocalData } from '../../lib/localWipe';
import { assertSafeCopy } from '../../lib/copyGuard';
import { isDev } from '../../lib/devBypass';
import { DevOptionsPanel } from '../../components/DevOptionsPanel';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { theme, fontSize, setTheme, setFontSize } = useSettings();
  const [tone, setTone] = useState<string>('Calm');
  
  const [pendingItems, setPendingItems] = useState<OutboxItem[]>([]);
  const [syncStatus, setSyncStatus] = useState(syncEngine.getSyncStatus());
  const [isSyncingLocal, setIsSyncingLocal] = useState(false);
  
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [showToast, setShowToast] = useState<string | null>(null);

  // Dev Options State
  const [clickCount, setClickCount] = useState(0);
  const [isDevPanelOpen, setIsDevPanelOpen] = useState(false);

  useEffect(() => {
    loadOnboardingDraft().then(d => {
      if (d.tonePreference) {
        setTone(d.tonePreference.charAt(0).toUpperCase() + d.tonePreference.slice(1));
      }
    });

    const refreshCounts = async () => {
      if (user) {
        const items = await outbox.list(user.id);
        setPendingItems(items);
      }
    };

    refreshCounts();
    const interval = setInterval(() => {
      setSyncStatus(syncEngine.getSyncStatus());
      refreshCounts();
    }, 2000);

    return () => clearInterval(interval);
  }, [user]);

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await signOut();
      navigate('/welcome');
    }
  };

  const handleSync = async () => {
    if (!user) return;
    setIsSyncingLocal(true);
    await syncEngine.syncNow(user.id);
    const items = await outbox.list(user.id);
    setPendingItems(items);
    setSyncStatus(syncEngine.getSyncStatus());
    setIsSyncingLocal(false);
  };

  const handleExportData = async () => {
    if (!user || !navigator.onLine) return;
    setIsExporting(true);
    try {
      const response = await edgeFunctions.invoke('account-export');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `t2d-companion-export-${user.id.slice(0, 8)}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      setShowToast('Your download is ready.');
      setTimeout(() => setShowToast(null), 3000);
    } catch (err: any) {
      alert(err.message || "Could not create export. Try again when online.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || deleteConfirmation !== 'DELETE' || !navigator.onLine) return;
    
    setIsDeleting(true);
    try {
      await edgeFunctions.invoke('account-delete', { confirmation: 'DELETE' });
      const userId = user.id;
      await signOut();
      await wipeAllUserLocalData(userId);
      navigate('/welcome');
    } catch (err: any) {
      alert(err.message || "Failed to delete account. Please try again later.");
      setIsDeleting(false);
    }
  };

  const handleVersionClick = () => {
    if (!isDev) return;
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 5) {
      setIsDevPanelOpen(true);
      setClickCount(0);
    }
    // Reset click count after 2 seconds of inactivity
    setTimeout(() => setClickCount(0), 2000);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      localStorage.clear();
      logger.info('User reset application state.');
      window.location.reload();
    }
  };

  const checkinPending = pendingItems.filter(i => i.op.type === 'UPSERT_DAILY_CHECKIN').length;
  const interactionPending = pendingItems.filter(i => i.op.type === 'INSERT_REMINDER_INTERACTION').length;
  const otherPending = pendingItems.length - checkinPending - interactionPending;

  return (
    <div className="space-y-8 pb-12 relative">
      <section className="space-y-4">
        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest px-1">Sync Status</h3>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${navigator.onLine ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {navigator.onLine ? 'Connected' : 'Offline'}
              </span>
            </div>
            {pendingItems.length > 0 && (
              <span className="text-[10px] font-extrabold uppercase px-2 py-1 bg-amber-100 text-amber-700 rounded-lg">
                {pendingItems.length} pending
              </span>
            )}
          </div>

          {pendingItems.length > 0 && (
            <div className="grid grid-cols-2 gap-2 pt-2">
              {checkinPending > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Logs</p>
                  <p className="text-sm font-bold">{checkinPending}</p>
                </div>
              )}
              {interactionPending > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Events</p>
                  <p className="text-sm font-bold">{interactionPending}</p>
                </div>
              )}
              {otherPending > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Settings</p>
                  <p className="text-sm font-bold">{otherPending}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-gray-700">
            <div className="text-xs text-gray-400">
              {syncStatus.lastSyncTime 
                ? `Last sync: ${new Date(syncStatus.lastSyncTime).toLocaleTimeString()}`
                : 'No sync recorded'}
            </div>
            <button 
              onClick={handleSync}
              disabled={isSyncingLocal || !navigator.onLine}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                !navigator.onLine || isSyncingLocal
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white shadow-md active:scale-95'
              }`}
            >
              {isSyncingLocal ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest px-1">Display Preferences</h3>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden transition-colors">
          <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <span className="text-xl">🌓</span>
              <span className="font-medium text-gray-700 dark:text-gray-200">Appearance</span>
            </div>
            <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
              <button onClick={() => setTheme('light')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${theme === 'light' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}>Light</button>
              <button onClick={() => setTheme('dark')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${theme === 'dark' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}>Dark</button>
            </div>
          </div>

          <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <span className="text-xl">AA</span>
              <span className="font-medium text-gray-700 dark:text-gray-200">Text Size</span>
            </div>
            <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
              {(['sm', 'md', 'lg'] as FontSize[]).map((size) => (
                <button 
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${fontSize === size ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-xl">🗣️</span>
              <span className="font-medium text-gray-700 dark:text-gray-200">App Voice</span>
            </div>
            <button onClick={() => navigate('/onboarding/tone')} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold">
              {tone} • Change
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest px-1">Data & Privacy</h3>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm space-y-6">
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">Export My Data</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Download all your logs and account information as a JSON file.</p>
            <button 
              onClick={handleExportData}
              disabled={isExporting || !navigator.onLine}
              className={`w-full py-3 rounded-xl text-xs font-bold transition-all border ${
                !navigator.onLine || isExporting
                  ? 'bg-gray-50 text-gray-400 border-gray-100'
                  : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-blue-600 dark:text-blue-400 active:bg-gray-50'
              }`}
            >
              {isExporting ? 'Preparing...' : 'Download My Data'}
            </button>
          </div>

          <div className="pt-4 border-t border-gray-50 dark:border-gray-700 space-y-4">
            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">Delete Account</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {assertSafeCopy("This will permanently delete your data from this account.")}
            </p>
            
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder='Type "DELETE" to confirm'
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className="w-full px-4 py-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl text-xs outline-none focus:ring-1 focus:ring-red-500 text-red-700"
              />
              <button 
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmation !== 'DELETE' || !navigator.onLine}
                className={`w-full py-3 rounded-xl text-xs font-bold transition-all ${
                  deleteConfirmation === 'DELETE' && navigator.onLine && !isDeleting
                    ? 'bg-red-600 text-white shadow-md active:scale-95'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isDeleting ? 'Deleting...' : 'Permanently Delete My Account'}
              </button>
            </div>
            {!navigator.onLine && <p className="text-[10px] text-red-500 text-center">Connection required for account deletion.</p>}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest px-1">Account</h3>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-700 shadow-sm transition-colors">
          <div className="p-4">
            <p className="text-xs text-gray-400 mb-1">Signed in as</p>
            <p className="font-bold text-gray-800 dark:text-white truncate">{user?.email}</p>
          </div>
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-between p-4 active:bg-gray-50 dark:active:bg-gray-700 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl">🚪</span>
              <span className="font-medium text-gray-700 dark:text-gray-200">Sign Out</span>
            </div>
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </section>

      <div className="pt-8 space-y-4">
        <button 
          onClick={handleReset}
          className="w-full py-4 text-red-600 font-bold bg-red-50 dark:bg-red-900/20 rounded-2xl active:bg-red-100 transition-colors"
        >
          Reset Application Data (Local Only)
        </button>
        <button 
          onClick={handleVersionClick}
          className="w-full text-center text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
        >
          T2D Companion v1.3.1-popia-ready
        </button>
      </div>

      {showToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full text-sm font-bold shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 z-50">
          {showToast}
        </div>
      )}

      {/* DEV OPTIONS MODAL */}
      {isDevPanelOpen && (
        <DevOptionsPanel 
          isOpen={isDevPanelOpen} 
          onClose={() => setIsDevPanelOpen(false)} 
        />
      )}
    </div>
  );
};
