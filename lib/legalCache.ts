import { store } from './store';

export interface LegalCacheEntry {
  userId: string;
  acceptedAtISO: string;
  consentVersion: string;
  disclaimerVersion: string;
}

const CACHE_KEY = 'legal_acceptance_cache';

export const legalCache = {
  set: async (entry: LegalCacheEntry) => {
    await store.set(`${CACHE_KEY}:${entry.userId}`, entry);
  },
  get: async (userId: string): Promise<LegalCacheEntry | null> => {
    return await store.get<LegalCacheEntry>(`${CACHE_KEY}:${userId}`);
  },
  clear: async (userId: string) => {
    await store.remove(`${CACHE_KEY}:${userId}`);
  }
};
