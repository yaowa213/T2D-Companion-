import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkinsStore } from '../../lib/checkinsStore';
import { getReinforcementMessage, TonePreference } from '../../lib/reinforcement';
import { DailyCheckin, Feeling, MedTaken } from '../../types/checkin';
import { assertSafeCopy } from '../../lib/copyGuard';
import { auditLocal } from '../../lib/auditLocal';
import { loadOnboardingDraft } from '../../lib/onboardingStore';
import { useAuth } from '../../app/AuthProvider';

export const CheckinPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [existingCheckin, setExistingCheckin] = useState<DailyCheckin | null>(null);
  
  const [feeling, setFeeling] = useState<Feeling | null>(null);
  const [medTaken, setMedTaken] = useState<MedTaken | null>(null);
  const [note, setNote] = useState('');
  const [tone, setTone] = useState<TonePreference>('calm');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const [today, onboarding] = await Promise.all([
        checkinsStore.getTodayCheckin(),
        loadOnboardingDraft()
      ]);
      
      if (onboarding.tonePreference) {
        setTone(onboarding.tonePreference as TonePreference);
      }

      if (today) {
        setExistingCheckin(today);
        setFeeling(today.feeling);
        setMedTaken(today.medTaken);
        setNote(today.note || '');
      }
      setLoading(false);
    };
    init();
  }, []);

  const handleSave = async () => {
    if (!user) return;
    
    const updated = await checkinsStore.upsertTodayCheckin(user.id, {
      feeling,
      medTaken,
      note
    });
    
    await auditLocal('checkin_saved', { 
      occurredAtISO: updated.occurredAtISO, 
      dayKey: updated.dayKey 
    });

    const msg = getReinforcementMessage(tone, feeling, medTaken);
    setSaveMessage(msg);
    setExistingCheckin(updated);
    setIsEditing(false);
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Loading today's log...</div>;

  const isComplete = existingCheckin && !isEditing;

  if (isComplete) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 p-6 rounded-3xl text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Done for today</h2>
          <p className="text-gray-600 dark:text-gray-400 italic" aria-live="polite">
            "{saveMessage || getReinforcementMessage(tone, feeling, medTaken)}"
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1">Your Entry</h3>
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Feeling</span>
              <span className="font-bold capitalize text-blue-600 dark:text-blue-400">{feeling}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Medication</span>
              <span className="font-bold capitalize text-blue-600 dark:text-blue-400">{medTaken?.replace('_', ' ')}</span>
            </div>
            {note && (
              <div className="pt-4 border-t border-gray-50 dark:border-gray-700">
                <span className="text-xs text-gray-400 uppercase block mb-2">Note</span>
                <p className="text-gray-700 dark:text-gray-300">{note}</p>
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={() => setIsEditing(true)}
          className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold rounded-2xl active:scale-95 transition-all min-h-[56px]"
        >
          Edit today's check-in
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
      <header>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {assertSafeCopy("Today's check-in")}
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          How is your routine going today?
        </p>
      </header>

      <div className="space-y-8">
        {/* Feeling Question */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest px-1">How are you feeling today?</h3>
          <div className="grid grid-cols-2 gap-2">
            {(['low', 'okay', 'good', 'skip'] as Feeling[]).map((f) => (
              <button
                key={f}
                onClick={() => setFeeling(f)}
                className={`py-4 rounded-2xl font-bold border transition-all min-h-[56px] capitalize ${
                  feeling === f 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Medication Question */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest px-1">Did you manage your medication?</h3>
          <div className="grid grid-cols-2 gap-2">
            {(['yes', 'not_yet', 'skip'] as MedTaken[]).map((m) => (
              <button
                key={m}
                onClick={() => setMedTaken(m)}
                className={`py-4 rounded-2xl font-bold border transition-all min-h-[56px] capitalize ${
                  medTaken === m 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                {m.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Note Field */}
        <div className="space-y-4">
          <div className="flex justify-between items-end px-1">
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">A short note for yourself? (optional)</h3>
            <span className={`text-[10px] font-bold ${note.length > 250 ? 'text-red-500' : 'text-gray-400'}`}>
              {280 - note.length} remaining
            </span>
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 280))}
            placeholder="How are you feeling? Any specific symptoms?"
            className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl min-h-[120px] outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-800 dark:text-gray-100"
          />
        </div>
      </div>

      <div className="flex space-x-3 pt-4">
        <button 
          onClick={() => isEditing ? setIsEditing(false) : navigate('/app/home')}
          className="flex-1 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-bold rounded-2xl min-h-[56px]"
        >
          Back
        </button>
        <button 
          onClick={handleSave}
          className="flex-[2] py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all min-h-[56px]"
        >
          Save check-in
        </button>
      </div>
    </div>
  );
};
