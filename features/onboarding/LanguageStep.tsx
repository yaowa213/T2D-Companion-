
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { saveOnboardingDraft } from '../../lib/onboardingStore';
import { assertSafeCopy } from '../../lib/copyGuard';

export const LanguageStep: React.FC = () => {
  const navigate = useNavigate();

  const handleSelect = async (lang: string) => {
    await saveOnboardingDraft({ language: lang });
    navigate('/onboarding/profile');
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          {assertSafeCopy("Choose your language")}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Pick the language you are most comfortable with.
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => handleSelect('en')}
          className="w-full p-6 text-left bg-white dark:bg-gray-800 border-2 border-blue-500 rounded-2xl shadow-sm flex justify-between items-center"
        >
          <span className="text-lg font-bold text-gray-900 dark:text-white">English</span>
          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </button>

        <button
          disabled
          className="w-full p-6 text-left bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl opacity-60 flex justify-between items-center"
        >
          <span className="text-lg font-medium text-gray-400">Afrikaans</span>
          <span className="text-xs font-bold text-gray-400 uppercase">Coming soon</span>
        </button>

        <button
          disabled
          className="w-full p-6 text-left bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl opacity-60 flex justify-between items-center"
        >
          <span className="text-lg font-medium text-gray-400">isiZulu</span>
          <span className="text-xs font-bold text-gray-400 uppercase">Coming soon</span>
        </button>
      </div>
    </div>
  );
};
