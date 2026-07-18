
import { redactPII } from './pii';

const isProd = false; // Placeholder for logic: process.env.NODE_ENV === 'production'

export const logger = {
  info: (message: string, ...args: any[]) => {
    if (isProd) return;
    console.info(`[INFO] ${redactPII(message)}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${redactPII(message)}`, ...args);
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${redactPII(message)}`, error);
  },
  debug: (message: string, ...args: any[]) => {
    if (isProd) return;
    console.debug(`[DEBUG] ${redactPII(message)}`, ...args);
  }
};
