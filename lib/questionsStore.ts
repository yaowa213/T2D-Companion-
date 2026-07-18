import { store } from './store';
import { outbox } from './outbox';

export interface SavedQuestion {
  id: string;
  question: string;
  createdAtISO: string;
}

const QUESTIONS_KEY_PREFIX = 'saved_questions:';

export const questionsStore = {
  list: async (userId: string): Promise<SavedQuestion[]> => {
    return await store.get<SavedQuestion[]>(`${QUESTIONS_KEY_PREFIX}${userId}`) || [];
  },

  add: async (userId: string, question: string): Promise<SavedQuestion> => {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newQuestion: SavedQuestion = { id, question, createdAtISO: now };
    
    const existing = await questionsStore.list(userId);
    const updated = [newQuestion, ...existing];
    await store.set(`${QUESTIONS_KEY_PREFIX}${userId}`, updated);

    await outbox.enqueue(userId, {
      type: "INSERT_SAVED_QUESTION",
      id,
      createdAtISO: now,
      payload: { id, question }
    });

    return newQuestion;
  },

  update: async (userId: string, id: string, question: string): Promise<void> => {
    const existing = await questionsStore.list(userId);
    const updated = existing.map(q => q.id === id ? { ...q, question } : q);
    await store.set(`${QUESTIONS_KEY_PREFIX}${userId}`, updated);

    await outbox.enqueue(userId, {
      type: "UPDATE_SAVED_QUESTION",
      id,
      createdAtISO: new Date().toISOString(),
      payload: { question }
    });
  },

  delete: async (userId: string, id: string): Promise<void> => {
    const existing = await questionsStore.list(userId);
    const updated = existing.filter(q => q.id !== id);
    await store.set(`${QUESTIONS_KEY_PREFIX}${userId}`, updated);

    await outbox.enqueue(userId, {
      type: "DELETE_SAVED_QUESTION",
      id,
      createdAtISO: new Date().toISOString(),
      payload: {}
    });
  },

  setBatch: async (userId: string, questions: SavedQuestion[]) => {
    await store.set(`${QUESTIONS_KEY_PREFIX}${userId}`, questions);
  }
};