import { Feeling, MedTaken } from '../types/checkin';
import { assertSafeCopy } from './copyGuard';

export type TonePreference = 'calm' | 'friendly' | 'direct';

const DEFAULT_SAFE = "Thanks for checking in. Small steps count.";

const MESSAGES: Record<TonePreference, Record<string, string>> = {
  calm: {
    both_skip: "Take your time. We're here when you're ready.",
    med_yes: "A steady routine brings peace of mind.",
    med_not_yet: "There is still time in your day. Go gently.",
    feeling_low: "Be kind to yourself today. Rest is productive.",
    feeling_good: "It is a peaceful moment. Enjoy this clarity.",
    generic: "Thank you for sharing your day with us."
  },
  friendly: {
    both_skip: "No worries! We can try again tomorrow.",
    med_yes: "Great job keeping up with your health goals!",
    med_not_yet: "You've got this! Still some time to fit that in.",
    feeling_low: "Sending some warmth your way. You're doing your best.",
    feeling_good: "So happy to hear you're feeling good!",
    generic: "Thanks for checking in! See you tomorrow."
  },
  direct: {
    both_skip: "Check-in logged. Ready for tomorrow.",
    med_yes: "Routine maintained. Good work.",
    med_not_yet: "Action item pending: Medication management.",
    feeling_low: "Logging a low day. Focus on recovery.",
    feeling_good: "Good status recorded.",
    generic: "Daily data updated successfully."
  }
};

// Validate all messages at module init
try {
  Object.values(MESSAGES).forEach(toneGroup => {
    Object.values(toneGroup).forEach(msg => assertSafeCopy(msg));
  });
} catch (e) {
  console.error("Safety check failed in reinforcement messages", e);
}

export const getReinforcementMessage = (
  tone: TonePreference,
  feeling: Feeling | null,
  medTaken: MedTaken | null
): string => {
  const toneMsgs = MESSAGES[tone] || MESSAGES.calm;

  try {
    if (feeling === 'skip' && medTaken === 'skip') return assertSafeCopy(toneMsgs.both_skip);
    if (medTaken === 'yes') return assertSafeCopy(toneMsgs.med_yes);
    if (medTaken === 'not_yet') return assertSafeCopy(toneMsgs.med_not_yet);
    if (feeling === 'low') return assertSafeCopy(toneMsgs.feeling_low);
    if (feeling === 'good') return assertSafeCopy(toneMsgs.feeling_good);
    
    return assertSafeCopy(toneMsgs.generic);
  } catch {
    return DEFAULT_SAFE;
  }
};
