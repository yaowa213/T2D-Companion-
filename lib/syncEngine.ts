import { outbox, OutboxItem } from './outbox';
import { supabaseProfileApi } from './supabaseProfileApi';
import { supabaseLogApi } from './supabaseLogApi';
import { supabaseVisitPrepApi } from './supabaseVisitPrepApi';
import { logger } from './logger';

let isSyncing = false;
let lastSyncTime: string | null = null;

const MAX_ATTEMPTS = 5;

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function processItem(item: OutboxItem) {
  const { op, userId, opId } = item;
  
  try {
    switch (op.type) {
      case "UPSERT_PROFILE":
        await supabaseProfileApi.upsertProfile(userId, op.payload);
        break;
      case "UPSERT_MEDICATION":
        await supabaseProfileApi.upsertMedication(userId, op.payload);
        break;
      case "UPSERT_MED_SCHEDULE":
        await supabaseProfileApi.upsertMedicationSchedule(userId, op.payload);
        break;
      case "DELETE_MEDICATION":
        await supabaseProfileApi.deleteMedication(userId, op.id);
        break;
      case "DELETE_MED_SCHEDULE":
        await supabaseProfileApi.deleteMedicationSchedule(userId, op.id);
        break;
      case "UPSERT_DAILY_CHECKIN":
        await supabaseLogApi.upsertDailyCheckin(userId, op.payload);
        break;
      case "INSERT_REMINDER_INTERACTION":
        await supabaseLogApi.insertReminderInteraction(userId, op.payload);
        break;
      case "INSERT_SAVED_QUESTION":
        await supabaseVisitPrepApi.addSavedQuestion(userId, { id: op.id, question: op.payload.question });
        break;
      case "UPDATE_SAVED_QUESTION":
        await supabaseVisitPrepApi.updateSavedQuestion(userId, op.id, op.payload.question);
        break;
      case "DELETE_SAVED_QUESTION":
        await supabaseVisitPrepApi.deleteSavedQuestion(userId, op.id);
        break;
    }
    await outbox.markDone(userId, opId);
    return true;
  } catch (err: any) {
    if (err.status === 401 || err.status === 403) {
      logger.warn(`Auth failure during sync for ${op.type}. Stopping loop.`);
      await outbox.updateError(userId, opId, "Authentication required");
      return false; 
    }

    logger.error(`Sync error on item ${opId} (${op.type}): ${err.message}`);
    await outbox.updateError(userId, opId, err.message);
    return false;
  }
}

export const syncEngine = {
  syncNow: async (userId: string): Promise<{ processed: number; failed: number }> => {
    if (isSyncing || !navigator.onLine) return { processed: 0, failed: 0 };
    
    isSyncing = true;
    let processed = 0;
    let failed = 0;

    const items = await outbox.list(userId);
    const sorted = [...items].sort((a, b) => 
      new Date(a.op.createdAtISO).getTime() - new Date(b.op.createdAtISO).getTime()
    );

    for (const item of sorted) {
      if (item.attemptCount >= MAX_ATTEMPTS) {
        failed++;
        continue;
      }

      const success = await processItem(item);
      if (success) {
        processed++;
      } else {
        failed++;
        break;
      }
      
      await delay(200);
    }

    lastSyncTime = new Date().toISOString();
    isSyncing = false;
    return { processed, failed };
  },

  getSyncStatus: () => ({
    isSyncing,
    lastSyncTime
  }),

  startSyncLoop: (userId: string) => {
    const handleOnline = () => syncEngine.syncNow(userId);
    window.addEventListener('online', handleOnline);
    const interval = setInterval(() => syncEngine.syncNow(userId), 1000 * 60 * 5);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      clearInterval(interval);
    };
  }
};