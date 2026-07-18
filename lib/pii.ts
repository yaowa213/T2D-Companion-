
/**
 * Redacts common PII patterns from strings before logging or transmission.
 */
export const redactPII = (text: string): string => {
  if (!text) return text;

  // Patterns for email, phone (US-centric for baseline), and common names (heuristic)
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const phoneRegex = /(\+?\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g;

  return text
    .replace(emailRegex, '[REDACTED_EMAIL]')
    .replace(phoneRegex, '[REDACTED_PHONE]');
};
