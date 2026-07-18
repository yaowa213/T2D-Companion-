
import { store } from './store';

export interface OnboardingData {
  language?: string;
  profile?: {
    ageRange?: string;
    diagnosisStatus?: string;
    clinicVisitFrequency?: string;
  };
  medications?: Array<{ id: string; name: string; reminderTime: string }>;
  tonePreference?: 'calm' | 'friendly' | 'direct';
}

const STORAGE_KEY = 'onboarding_draft';

/**
 * Loads the current onboarding draft from IndexedDB.
 */
export const loadOnboardingDraft = async (): Promise<OnboardingData> => {
  return (await store.get<OnboardingData>(STORAGE_KEY)) || {};
};

/**
 * Updates the onboarding draft with partial data.
 */
export const saveOnboardingDraft = async (partialUpdate: Partial<OnboardingData>): Promise<OnboardingData> => {
  const current = await loadOnboardingDraft();
  const updated = { 
    ...current, 
    ...partialUpdate,
    profile: partialUpdate.profile ? { ...current.profile, ...partialUpdate.profile } : current.profile
  };
  await store.set(STORAGE_KEY, updated);
  return updated;
};

/**
 * Clears the onboarding draft once completed.
 */
export const clearOnboardingDraft = async () => {
  await store.remove(STORAGE_KEY);
};
