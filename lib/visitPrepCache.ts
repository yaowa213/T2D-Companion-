import { store } from './store';

export interface VisitPrepCacheData {
  checkins: any[];
  interactions: any[];
  questions: any[];
  cachedAtISO: string;
}

const CACHE_KEY_PREFIX = 'visitprep_cache:';

export const visitPrepCache = {
  set: async (userId: string, data: Omit<VisitPrepCacheData, 'cachedAtISO'>) => {
    const entry: VisitPrepCacheData = {
      ...data,
      cachedAtISO: new Date().toISOString()
    };
    await store.set(`${CACHE_KEY_PREFIX}${userId}`, entry);
  },
  get: async (userId: string): Promise<VisitPrepCacheData | null> => {
    return await store.get<VisitPrepCacheData>(`${CACHE_KEY_PREFIX}${userId}`);
  },
  clear: async (userId: string) => {
    await store.remove(`${CACHE_KEY_PREFIX}${userId}`);
  }
};