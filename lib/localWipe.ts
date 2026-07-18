import localforage from 'localforage';
import { logger } from './logger';

/**
 * Wipes all user-specific data from local storage.
 * Iterates through all keys to find user-prefixed data.
 */
export const wipeAllUserLocalData = async (userId: string): Promise<void> => {
  try {
    const keys = await localforage.keys();
    
    // User-specific prefixes used across the app
    const userPrefixes = [
      `outbox:${userId}`,
      `legal_acceptance_cache:${userId}`,
      `profile_snapshot:${userId}`,
      `visitprep_cache:${userId}`,
      `visitprep_note:${userId}`,
      `saved_questions:${userId}`,
      `medication:`, // These aren't strictly prefixed by userId in the current store impl
      `medSchedule:`, // but we should clear them anyway to ensure privacy
      `interaction:`,
      `appointment:`,
      `checkin:`,
      'medicationsIndex',
      'medSchedulesIndex',
      'reminderInteractionsIndex',
      'appointmentsIndex',
      'checkins_index',
      'local_audits',
      'onboarding_draft'
    ];

    const deletions = keys.map(async (key) => {
      const shouldDelete = userPrefixes.some(prefix => key.startsWith(prefix));
      if (shouldDelete) {
        await localforage.removeItem(key);
      }
    });

    await Promise.all(deletions);
    logger.info(`Local data wiped for user: ${userId}`);
  } catch (err) {
    logger.error(`Failed to wipe local data for user: ${userId}`, err);
  }
};
