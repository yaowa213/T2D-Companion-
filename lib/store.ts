
import localforage from 'localforage';

// Configure localforage for persistent IndexedDB storage
localforage.config({
  name: 't2d-companion',
  storeName: 'app_data'
});

export const store = {
  get: async <T,>(key: string): Promise<T | null> => {
    return await localforage.getItem<T>(key);
  },
  set: async <T,>(key: string, value: T): Promise<T> => {
    return await localforage.setItem<T>(key, value);
  },
  remove: async (key: string): Promise<void> => {
    await localforage.removeItem(key);
  },
  clear: async (): Promise<void> => {
    await localforage.clear();
  }
};
