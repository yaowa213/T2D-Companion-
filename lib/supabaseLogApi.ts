import { supabase } from './supabaseClient';
import { z } from 'zod';

const CheckinSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string(),
  occurred_at: z.string().datetime(),
  day_key: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  feeling: z.enum(["low", "okay", "good", "skip"]).nullable(),
  med_taken: z.enum(["yes", "not_yet", "skip"]).nullable(),
  note: z.string().max(280).nullable()
});

const InteractionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string(),
  kind: z.enum(["medication", "appointment", "habit"]),
  entity_id: z.string().uuid().nullable(),
  scheduled_for: z.string().datetime(),
  action: z.enum(["acknowledged", "skipped", "missed", "opened"])
});

export const supabaseLogApi = {
  upsertDailyCheckin: async (userId: string, payload: any) => {
    const data = CheckinSchema.parse({ ...payload, user_id: userId });
    const { error } = await supabase
      .from('daily_checkins')
      .upsert(data, { onConflict: 'id' });
    if (error) throw error;
  },

  insertReminderInteraction: async (userId: string, payload: any) => {
    const data = InteractionSchema.parse({ ...payload, user_id: userId });
    // Using upsert for interactions too to handle idempotent retries (conflict = success)
    const { error } = await supabase
      .from('reminder_interactions')
      .upsert(data, { onConflict: 'id' });
    if (error) throw error;
  }
};
