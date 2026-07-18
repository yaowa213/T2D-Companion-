
export const DEV_BYPASS_KEY = "DEV_BYPASS_ENABLED";

/**
 * Returns true only in development builds.
 * Vite will strip code gated by this check during production builds.
 */
export const isDevBuild = (): boolean => {
  return (import.meta as any).env?.DEV === true;
};

/**
 * Returns whether the developer bypass is currently active.
 * Forcefully returns false in production.
 */
export const getDevBypassEnabled = (): boolean => {
  if (!isDevBuild()) return false;
  return localStorage.getItem(DEV_BYPASS_KEY) === 'true';
};

/**
 * Sets the developer bypass state. No-op in production.
 */
export const setDevBypassEnabled = (value: boolean): void => {
  if (!isDevBuild()) return;
  localStorage.setItem(DEV_BYPASS_KEY, String(value));
};

/**
 * Clears all developer-specific local state and reloads the application.
 * No-op in production.
 */
export const clearDevState = (): void => {
  if (!isDevBuild()) return;
  localStorage.removeItem(DEV_BYPASS_KEY);
  localStorage.removeItem('onboarding_draft'); // Clean up partial onboarding state
  window.location.reload();
};
