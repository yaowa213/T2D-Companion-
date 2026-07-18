
import { isDevBuild, getDevBypassEnabled, DEV_BYPASS_KEY } from './devFlags';

export const isDev = isDevBuild();

export const BYPASS_KEY = DEV_BYPASS_KEY;

export const getBypassActive = (): boolean => {
  return getDevBypassEnabled();
};

export const setBypassActive = (active: boolean): void => {
  if (!isDev) return;
  localStorage.setItem(BYPASS_KEY, String(active));
};

export const clearDevState = (): void => {
  if (!isDev) return;
  localStorage.removeItem(BYPASS_KEY);
  localStorage.removeItem('onboarding_draft');
  window.location.reload();
};

export const MOCK_USER = {
  id: "dev-user",
  email: "dev@localhost",
  aud: "authenticated",
  role: "authenticated",
  app_metadata: {},
  user_metadata: {},
  created_at: new Date().toISOString()
};
