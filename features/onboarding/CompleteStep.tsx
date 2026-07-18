import React from 'react';
import { useNavigate } from 'react-router-dom';
import { clearOnboardingDraft } from '../../lib/onboardingStore';
import { auditLocal } from '../../lib/auditLocal';
import { assertSafeCopy } from '../../lib/copyGuard';
import { syncEngine } from '../../lib/syncEngine';
import { useAuth } from '../../app/AuthProvider';

export const CompleteStep: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleFinish = async () => {
    localStorage.setItem('onboardingDone', 'true');
    await auditLocal('onboarding_completed', {});
    await clearOnboardingDraft();
    
    if (user) {
      // Best-effort sync before redirecting
      syncEngine.syncNow(user.id);
    }
    
    navigate('/app/home');
  };

  return (
    <div className="space-y-8 flex flex-col items-center text-center">
      <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mb-4 animate-bounce">
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          {assertSafeCopy("You’re all set")}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Your personalized companion is ready to support your health journey.
        </p>
      </div>

      <div className="w-full space-y-4 text-left bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800">
        <h3 className="font-bold text-blue-800 dark:text-blue-300">What’s next?</h3>
        <ul className="space-y-3">
          <li className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Daily check-ins for logs</span>
          </li>
          <li className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Gentle reminders for med intake</span>
          </li>
          <li className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Visit preparation tools</span>
          </li>
        </ul>
      </div>

      <div className="w-full pt-8">
        <button
          onClick={handleFinish}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all min-h-[56px]"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
};
