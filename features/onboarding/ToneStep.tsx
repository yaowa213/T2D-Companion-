import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveOnboardingDraft, loadOnboardingDraft } from '../../lib/onboardingStore';
import { assertSafeCopy } from '../../lib/copyGuard';
import { outbox } from '../../lib/outbox';
import { useAuth } from '../../app/AuthProvider';

type Tone = 'calm' | 'friendly' | 'direct';

export const ToneStep: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tone, setTone] = useState<Tone>('calm');

  useEffect(() => {
    loadOnboardingDraft().then(d => {
      if (d.tonePreference) setTone(d.tonePreference);
    });
  }, []);

  const handleNext = async () => {
    await saveOnboardingDraft({ tonePreference: tone });

    if (user) {
      await outbox.enqueue(user.id, {
        type: "UPSERT_PROFILE",
        id: user.id,
        createdAtISO: new Date().toISOString(),
        payload: { tone_preference: tone }
      });
    }

    navigate('/onboarding/complete');
  };

  const tones: Array<{ id: Tone; label: string; example: string; icon: string }> = [
    { 
      id: 'calm', 
      label: 'Calm', 
      example: assertSafeCopy("It's time for your morning check-in. Take your time."), 
      icon: '🌿' 
    },
    { 
      id: 'friendly', 
      label: 'Friendly', 
      example: assertSafeCopy("Good morning! Ready to see how your numbers are doing today?"), 
      icon: '😊' 
    },
    { 
      id: 'direct', 
      label: 'Direct', 
      example: assertSafeCopy("Morning check-in: Glucose reading needed."), 
      icon: '🎯' 
    },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          {assertSafeCopy("How should the app speak to you?")}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Choose a voice that feels most comfortable for your health journey.
        </p>
      </div>

      <div className="space-y-4">
        {tones.map((t) => (
          <button
            key={t.id}
            onClick={() => setTone(t.id)}
            className={`w-full p-5 text-left rounded-2xl border-2 transition-all flex items-start space-x-4 ${
              tone === t.id 
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 shadow-sm' 
                : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
            }`}
          >
            <span className="text-3xl mt-1">{t.icon}</span>
            <div className="flex-1">
              <p className={`font-bold ${tone === t.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-gray-100'}`}>
                {t.label}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 italic">
                "{t.example}"
              </p>
            </div>
            {tone === t.id && (
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center mt-1">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="pt-4">
        <button
          onClick={handleNext}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all min-h-[56px]"
        >
          Next
        </button>
      </div>
    </div>
  );
};
