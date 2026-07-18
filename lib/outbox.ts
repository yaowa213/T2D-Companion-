import { store } from './store';

export type OutboxOp =
  | { type: "UPSERT_PROFILE"; id: string; createdAtISO: string; payload: any }
  | { type: "UPSERT_MEDICATION"; id: string; createdAtISO: string; payload: any }
  | { type: "UPSERT_MED_SCHEDULE"; id: string; createdAtISO: string; payload: any }
  | { type: "DELETE_MEDICATION"; id: string; createdAtISO: string; payload: any }
  | { type: "DELETE_MED_SCHEDULE"; id: string; createdAtISO: string; payload: any }
  | { type: "UPSERT_DAILY_CHECKIN"; id: string; createdAtISO: string; payload: any }
  | { type: "INSERT_REMINDER_INTERACTION"; id: string; createdAtISO: string; payload: any }
  | { type: "INSERT_SAVED_QUESTION"; id: string; createdAtISO: string; payload: any }
  | { type: "UPDATE_SAVED_QUESTION"; id: string; createdAtISO: string; payload: any }
  | { type: "DELETE_SAVED_QUESTION"; id: string; createdAtISO: string; payload: any };

export type OutboxItem = {
  opId: string;
  userId: string;
  op: OutboxOp;
  attemptCount: number;
  lastError: string | null;
};

const getOutboxKey = (userId: string) => `outbox:${userId}`;

export const outbox = {
  enqueue: async (userId: string, op: OutboxOp): Promise<void> => {
    const key = getOutboxKey(userId);
    const items = await store.get<OutboxItem[]>(key) || [];
    
    const newItem: OutboxItem = {
      opId: crypto.randomUUID(),
      userId,
      op,
      attemptCount: 0,
      lastError: null
    };

    await store.set(key, [...items, newItem]);
  },

  list: async (userId: string): Promise<OutboxItem[]> => {
    return await store.get<OutboxItem[]>(getOutboxKey(userId)) || [];
  },

  markDone: async (userId: string, opId: string): Promise<void> => {
    const key = getOutboxKey(userId);
    const items = await store.get<OutboxItem[]>(key) || [];
    await store.set(key, items.filter(i => i.opId !== opId));
  },

  updateError: async (userId: string, opId: string, err: string): Promise<void> => {
    const key = getOutboxKey(userId);
    const items = await store.get<OutboxItem[]>(key) || [];
    const updated = items.map(i => {
      if (i.opId === opId) {
        return { ...i, attemptCount: i.attemptCount + 1, lastError: err.slice(0, 200) };
      }
      return i;
    });
    await store.set(key, updated);
  }
};