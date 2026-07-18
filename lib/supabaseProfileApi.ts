import { supabase } from './supabaseClient';
import { z } from 'zod';

const ProfileSchema = z.object({
  user_id: z.string(),
  language: z.string().optional(),
  age_range: z.string().optional(),
  diagnosis_status: z.string().optional(),
  clinic_visit_frequency: z.string().optional(),
  tone_preference: z.string().optional()
});

const MedicationSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string(),
  name: z.string().max(50)
});

const ScheduleSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string(),
  medication_id: z.string().uuid(),
  time_local: z.string().regex(/^\d{2}:\d{2}$/)
});

export const supabaseProfileApi = {
  upsertProfile: async (userId: string, payload: any) => {
    const data = ProfileSchema.parse({ ...payload, user_id: userId });
    const { error } = await supabase
      .from('profiles')
      .upsert(data, { onConflict: 'user_id' });
    if (error) throw error;
  },

  upsertMedication: async (userId: string, payload: any) => {
    const data = MedicationSchema.parse({ ...payload, user_id: userId });
    const { error } = await supabase
      .from('medications')
      .upsert(data, { onConflict: 'id' });
    if (error) throw error;
  },

  deleteMedication: async (userId: string, medicationId: string) => {
    const { error } = await supabase
      .from('medications')
      .delete()
      .eq('id', medicationId)
      .eq('user_id', userId);
    if (error) throw error;
  },

  upsertMedicationSchedule: async (userId: string, payload: any) => {
    const data = ScheduleSchema.parse({ ...payload, user_id: userId });
    const { error } = await supabase
      .from('medication_schedules')
      .upsert(data, { onConflict: 'id' });
    if (error) throw error;
  },

  deleteMedicationSchedule: async (userId: string, scheduleId: string) => {
    const { error } = await supabase
      .from('medication_schedules')
      .delete()
      .eq('id', scheduleId)
      .eq('user_id', userId);
    if (error) throw error;
  },

  fetchProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  }
};
