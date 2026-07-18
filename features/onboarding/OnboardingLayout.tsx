
import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { loadOnboardingDraft, OnboardingData } from '../../lib/onboardingStore';

export const OnboardingLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState<OnboardingData | null>(null);

  useEffect(() => {
    loadOnboardingDraft().then(setData);
  }, [location.pathname]);

  if (!data) return null;

  const steps = [
    { path: '/onboarding/language', label: 'Language' },
    { path: '/onboarding/profile', label: 'Profile' },
    { path: '/onboarding/medications', label: 'Medications' },
    { path: '/onboarding/tone', label: 'Tone' },
    { path: '/onboarding/complete', label: 'Complete' },
  ];

  const currentStepIndex = steps.findIndex(s => location.pathname.includes(s.path));
  
  // Guard: Ensure user doesn't skip ahead
  if (currentStepIndex > 0) {
    const prevStep = steps[currentStepIndex - 1];
    // Very basic check: if language isn't set, go back to start
    if (!data.language && currentStepIndex > 0) {
      return <Navigate to="/onboarding/language" replace />;
    }
  }

  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col max-w-md mx-auto shadow-xl">
      <div className="p-6 pb-0">
        <div className="flex justify-between items-center mb-6">
          {currentStepIndex > 0 ? (
            <button 
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 text-gray-500 hover:text-gray-900 dark:text-gray-400"
              aria-label="Back"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          ) : <div className="w-10" />}
          
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Step {currentStepIndex + 1} of {steps.length}
          </span>
          
          <div className="w-10" />
        </div>
        
        <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet context={{ data, setData }} />
      </main>
    </div>
  );
};
