import { supabase } from './supabaseClient';
import { z } from 'zod';
import { assertSafeCopy } from './copyGuard';

const QuestionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string(),
  question: z.string().min(1).max(200)
});

export const supabaseVisitPrepApi = {
  listCheckinsLastNDays: async (userId: string, days = 14) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    const isoDate = date.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_checkins')
      .select('*')
      .eq('user_id', userId)
      .gte('day_key', isoDate)
      .order('day_key', { ascending: false });

    if (error) throw error;
    return data;
  },

  listMedicationInteractionsLastNDays: async (userId: string, days = 14) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    const isoDate = date.toISOString();

    const { data, error } = await supabase
      .from('reminder_interactions')
      .select('*')
      .eq('user_id', userId)
      .eq('kind', 'medication')
      .gte('scheduled_for', isoDate)
      .order('scheduled_for', { ascending: false });

    if (error) throw error;
    return data;
  },

  listSavedQuestions: async (userId: string) => {
    const { data, error } = await supabase
      .from('saved_questions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  addSavedQuestion: async (userId: string, payload: { id: string, question: string }) => {
    // Basic clinical keyword check before even sending to server
    assertSafeCopy(payload.question);
    const data = QuestionSchema.parse({ ...payload, user_id: userId });
    const { error } = await supabase
      .from('saved_questions')
      .insert(data);
    if (error) throw error;
  },

  updateSavedQuestion: async (userId: string, id: string, question: string) => {
    assertSafeCopy(question);
    const { error } = await supabase
      .from('saved_questions')
      .update({ question })
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw error;
  },

  deleteSavedQuestion: async (userId: string, id: string) => {
    const { error } = await supabase
      .from('saved_questions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw error;
  }
};