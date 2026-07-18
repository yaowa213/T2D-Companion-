
import React from 'react';
import { Navigate } from 'react-router-dom';

export const RequireOnboarding: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isLegalAccepted = localStorage.getItem('legalAccepted') === 'true';
  const isOnboardingDone = localStorage.getItem('onboardingDone') === 'true';

  if (!isLegalAccepted) {
    return <Navigate to="/legal" replace />;
  }

  if (!isOnboardingDone) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};
