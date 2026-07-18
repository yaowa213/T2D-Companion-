import { store } from './store';

export interface ProfileSnapshot {
  user_id: string;
  language: string;
  age_range: string;
  diagnosis_status: string;
  clinic_visit_frequency: string;
  tone_preference: string;
  last_updated_at: string;
}

const PROFILE_CACHE_KEY = 'profile_snapshot';

export const profileCache = {
  set: async (userId: string, snapshot: ProfileSnapshot) => {
    await store.set(`${PROFILE_CACHE_KEY}:${userId}`, snapshot);
  },
  get: async (userId: string): Promise<ProfileSnapshot | null> => {
    return await store.get<ProfileSnapshot>(`${PROFILE_CACHE_KEY}:${userId}`);
  },
  clear: async (userId: string) => {
    await store.remove(`${PROFILE_CACHE_KEY}:${userId}`);
  }
};
