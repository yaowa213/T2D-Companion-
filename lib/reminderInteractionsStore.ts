import { store } from './store';
import { ReminderInteraction } from '../types/reminders';
import { auditLocal } from './auditLocal';
import { outbox } from './outbox';

const INT_PREFIX = 'interaction:';
const INT_INDEX = 'reminderInteractionsIndex';

export const reminderInteractionsStore = {
  logInteraction: async (userId: string, interaction: Omit<ReminderInteraction, 'id' | 'occurredAtISO'>): Promise<ReminderInteraction> => {
    const now = new Date().toISOString();
    const record: ReminderInteraction = {
      ...interaction,
      id: crypto.randomUUID(),
      occurredAtISO: now
    };

    await store.set(`${INT_PREFIX}${record.id}`, record);
    const index = await store.get<string[]>(INT_INDEX) || [];
    await store.set(INT_INDEX, [record.id, ...index].slice(0, 100)); // Keep last 100

    await auditLocal('reminder_interaction_logged', {
      kind: record.kind,
      action: record.action,
      entityId: record.entityId
    });

    // Enqueue for Supabase
    await outbox.enqueue(userId, {
      type: "INSERT_REMINDER_INTERACTION",
      id: record.id,
      createdAtISO: now,
      payload: {
        id: record.id,
        kind: record.kind,
        entity_id: record.entityId,
        scheduled_for: record.scheduledForISO,
        action: record.action
      }
    });

    return record;
  },

  listRecent: async (limit = 10): Promise<ReminderInteraction[]> => {
    const index = await store.get<string[]>(INT_INDEX) || [];
    const results = await Promise.all(index.slice(0, limit).map(id => store.get<ReminderInteraction>(`${INT_PREFIX}${id}`)));
    return results.filter((i): i is ReminderInteraction => i !== null);
  }
};
