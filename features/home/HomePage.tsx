import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assertSafeCopy } from '../../lib/copyGuard';
import { checkinsStore } from '../../lib/checkinsStore';
import { DailyCheckin } from '../../types/checkin';
import { useAuth } from '../../app/AuthProvider';
import { supabaseProfileApi } from '../../lib/supabaseProfileApi';
import { profileCache } from '../../lib/profileCache';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userName, setUserName] = useState('Friend');
  const [todayCheckin, setTodayCheckin] = useState<DailyCheckin | null>(null);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      // 1. Get today's local checkin
      checkinsStore.getTodayCheckin().then(setTodayCheckin);

      // 2. Load profile from cache
      const cached = await profileCache.get(user.id);
      if (cached) {
        // Since we don't have a 'name' field in profiles yet, we'll keep using Friend
        // but we'll try to fetch fresh data if online
        setUserName('Friend'); 
      }

      // 3. Try online fetch if possible
      if (navigator.onLine) {
        try {
          const profile = await supabaseProfileApi.fetchProfile(user.id);
          if (profile) {
            await profileCache.set(user.id, profile);
          }
        } catch (e) {
          console.warn('Failed to refresh profile snapshot', e);
        }
      }
    };

    loadData();
  }, [user]);
  
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Hello, {userName}</h2>
        <p className="text-gray-600 dark:text-gray-400">{assertSafeCopy("Ready to focus on your well-being today?")}</p>
      </section>

      {/* Check-in Card */}
      <section 
        onClick={() => navigate('/app/checkin')}
        className={`p-6 rounded-3xl border transition-all cursor-pointer active:scale-[0.98] ${
          todayCheckin 
            ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800' 
            : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-sm'
        }`}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-md">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          {todayCheckin && (
            <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold uppercase px-2 py-1 rounded-full">
              Complete
            </span>
          )}
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
          {todayCheckin ? 'Check-in Done' : "Today's Check-in"}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {todayCheckin 
            ? 'You have recorded your stats for today. Tap to view or edit.' 
            : 'Take a minute to log how you are feeling and your medications.'}
        </p>
      </section>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800 flex flex-col transition-colors">
          <span className="text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">Average Glucose</span>
          <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">112 <small className="text-sm font-normal text-gray-500 dark:text-gray-400">mg/dL</small></span>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl border border-green-100 dark:border-green-800 flex flex-col transition-colors">
          <span className="text-green-600 dark:text-green-400 text-xs font-bold uppercase tracking-wider mb-2">In Range</span>
          <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">92 <small className="text-sm font-normal text-gray-500 dark:text-gray-400">%</small></span>
        </div>
      </div>

      <section className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 shadow-sm transition-colors">
        <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4">Today's Tasks</h3>
        <ul className="space-y-3">
          <li className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
             <div className="w-6 h-6 rounded-full border-2 border-blue-500 flex-shrink-0" />
             <span className="text-sm text-gray-700 dark:text-gray-300">Check morning glucose</span>
          </li>
          <li className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
             <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
               <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
             </div>
             <span className="text-sm text-gray-400 dark:text-gray-500 line-through">Morning Metformin</span>
          </li>
        </ul>
      </section>
    </div>
  );
};
