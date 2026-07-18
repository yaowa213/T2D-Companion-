import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { RequireAuth } from '../components/RequireAuth';
import { RequireLegal } from '../components/RequireLegal';
import { RequireOnboarding } from '../components/RequireOnboarding';

import { WelcomePage } from '../features/welcome/WelcomePage';
import { LoginPage } from '../features/auth/LoginPage';
import { LegalPage } from '../features/legal/LegalPage';
import { OnboardingLayout } from '../features/onboarding/OnboardingLayout';
import { LanguageStep } from '../features/onboarding/LanguageStep';
import { ProfileStep } from '../features/onboarding/ProfileStep';
import { MedicationsStep } from '../features/onboarding/MedicationsStep';
import { ToneStep } from '../features/onboarding/ToneStep';
import { CompleteStep } from '../features/onboarding/CompleteStep';

import { HomePage } from '../features/home/HomePage';
import { CheckinPage } from '../features/checkin/CheckinPage';
import { RemindersPage } from '../features/reminders/RemindersPage';
import { VisitPrepPage } from '../features/visitprep/VisitPrepPage';
import { SettingsPage } from '../features/settings/SettingsPage';

export const AppRouter: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Legal Flow (Auth Required) */}
        <Route path="/legal" element={
          <RequireAuth>
            <LegalPage />
          </RequireAuth>
        } />
        
        {/* Onboarding Flow */}
        <Route path="/onboarding" element={
          <RequireAuth>
            <RequireLegal>
              <OnboardingLayout />
            </RequireLegal>
          </RequireAuth>
        }>
          <Route path="language" element={<LanguageStep />} />
          <Route path="profile" element={<ProfileStep />} />
          <Route path="medications" element={<MedicationsStep />} />
          <Route path="tone" element={<ToneStep />} />
          <Route path="complete" element={<CompleteStep />} />
          <Route index element={<Navigate to="language" replace />} />
        </Route>

        {/* Protected App Routes */}
        <Route path="/app" element={
          <RequireAuth>
            <RequireLegal>
              <RequireOnboarding>
                <Layout />
              </RequireOnboarding>
            </RequireLegal>
          </RequireAuth>
        }>
          <Route path="home" element={<HomePage />} />
          <Route path="checkin" element={<CheckinPage />} />
          <Route path="reminders" element={<RemindersPage />} />
          <Route path="visit-prep" element={<VisitPrepPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route index element={<Navigate to="/app/home" replace />} />
        </Route>

        {/* Root Redirect */}
        <Route path="/" element={<Navigate to="/welcome" replace />} />
        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
    </HashRouter>
  );
};
