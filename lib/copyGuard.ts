import { logger } from './logger';
import { BANNED_PHRASES, BANNED_REGEX } from './copyGuardRules';

const DEFAULT_SAFE_MESSAGE = "Information available in your clinical records.";

/**
 * Strips HTML and normalizes whitespace.
 */
const sanitize = (text: string): string => {
  return text
    .replace(/<[^>]*>?/gm, '') // Strip HTML
    .replace(/\s+/g, ' ')      // Normalize whitespace
    .trim();
};

/**
 * Validates text against safety rules.
 * Throws in dev, returns fallback in prod.
 */
export const assertSafeCopy = (text: string): string => {
  const cleanText = sanitize(text);
  const lowercase = cleanText.toLowerCase();
  
  const foundPhrase = BANNED_PHRASES.find(phrase => {
    const regex = new RegExp(`\\b${phrase}\\b`, 'i');
    return regex.test(lowercase);
  });

  const foundRegex = BANNED_REGEX.find(rx => rx.test(lowercase));
  
  if (foundPhrase || foundRegex) {
    const violation = foundPhrase || 'Regex Match';
    const errorMsg = `Safety Violation: Prohibited phrase "${violation}" detected.`;
    
    logger.error(errorMsg);
    
    // In real app, check process.env.NODE_ENV
    const isDev = true; 
    if (isDev) {
      throw new Error(errorMsg);
    }
    return DEFAULT_SAFE_MESSAGE;
  }

  return cleanText;
};
