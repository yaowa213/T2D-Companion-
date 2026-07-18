import { store } from './store';
import { DailyCheckin, Feeling, MedTaken } from '../types/checkin';
import { toLocalDayKey } from './dateKey';
import { outbox } from './outbox';

const CHECKIN_PREFIX = 'checkin:';
const INDEX_KEY = 'checkins_index';

export const checkinsStore = {
  getTodayCheckin: async (): Promise<DailyCheckin | null> => {
    const dayKey = toLocalDayKey();
    return await store.get<DailyCheckin>(`${CHECKIN_PREFIX}${dayKey}`);
  },

  upsertTodayCheckin: async (userId: string, input: { 
    feeling: Feeling | null; 
    medTaken: MedTaken | null; 
    note: string | null 
  }): Promise<DailyCheckin> => {
    const dayKey = toLocalDayKey();
    const existing = await checkinsStore.getTodayCheckin();
    const now = new Date().toISOString();
    
    const checkin: DailyCheckin = {
      id: existing?.id || crypto.randomUUID(),
      occurredAtISO: now,
      dayKey,
      feeling: input.feeling,
      medTaken: input.medTaken,
      note: input.note ? input.note.slice(0, 280) : null,
      createdAtISO: existing?.createdAtISO || now
    };

    await store.set(`${CHECKIN_PREFIX}${dayKey}`, checkin);

    // Update index if new
    if (!existing) {
      const index = await store.get<string[]>(INDEX_KEY) || [];
      if (!index.includes(dayKey)) {
        index.push(dayKey);
        index.sort((a, b) => b.localeCompare(a)); // Descending
        await store.set(INDEX_KEY, index);
      }
    }

    // Enqueue for Supabase
    await outbox.enqueue(userId, {
      type: "UPSERT_DAILY_CHECKIN",
      id: checkin.id,
      createdAtISO: now,
      payload: {
        id: checkin.id,
        occurred_at: checkin.occurredAtISO,
        day_key: checkin.dayKey,
        feeling: checkin.feeling,
        med_taken: checkin.medTaken,
        note: checkin.note
      }
    });

    return checkin;
  },

  listRecentCheckins: async (days: number = 14): Promise<DailyCheckin[]> => {
    const index = await store.get<string[]>(INDEX_KEY) || [];
    const recentKeys = index.slice(0, days);
    
    const results = await Promise.all(
      recentKeys.map(key => store.get<DailyCheckin>(`${CHECKIN_PREFIX}${key}`))
    );
    
    return results.filter((c): c is DailyCheckin => c !== null);
  }
};
