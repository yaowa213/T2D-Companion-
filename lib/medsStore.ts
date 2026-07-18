import { store } from './store';
import { Medication, MedicationSchedule } from '../types/reminders';

const MED_PREFIX = 'medication:';
const SCHED_PREFIX = 'medSchedule:';
const MED_INDEX = 'medicationsIndex';
const SCHED_INDEX = 'medSchedulesIndex';

export const medsStore = {
  addMedication: async (name: string): Promise<Medication> => {
    const med: Medication = {
      id: crypto.randomUUID(),
      name: name.slice(0, 50),
      isActive: true,
      createdAtISO: new Date().toISOString()
    };
    await store.set(`${MED_PREFIX}${med.id}`, med);
    const index = await store.get<string[]>(MED_INDEX) || [];
    await store.set(MED_INDEX, [...index, med.id]);
    return med;
  },

  addSchedule: async (medicationId: string, timeLocal: string): Promise<MedicationSchedule> => {
    const sched: MedicationSchedule = {
      id: crypto.randomUUID(),
      medicationId,
      timeLocal,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      isActive: true,
      createdAtISO: new Date().toISOString()
    };
    await store.set(`${SCHED_PREFIX}${sched.id}`, sched);
    const index = await store.get<string[]>(SCHED_INDEX) || [];
    await store.set(SCHED_INDEX, [...index, sched.id]);
    return sched;
  },

  listAll: async (): Promise<{ medications: Medication[], schedules: MedicationSchedule[] }> => {
    const medIdx = await store.get<string[]>(MED_INDEX) || [];
    const schedIdx = await store.get<string[]>(SCHED_INDEX) || [];
    
    const [medications, schedules] = await Promise.all([
      Promise.all(medIdx.map(id => store.get<Medication>(`${MED_PREFIX}${id}`))),
      Promise.all(schedIdx.map(id => store.get<MedicationSchedule>(`${SCHED_PREFIX}${id}`)))
    ]);

    return {
      medications: medications.filter((m): m is Medication => m !== null),
      schedules: schedules.filter((s): s is MedicationSchedule => s !== null)
    };
  },

  toggleSchedule: async (id: string, active: boolean): Promise<void> => {
    const sched = await store.get<MedicationSchedule>(`${SCHED_PREFIX}${id}`);
    if (sched) {
      sched.isActive = active;
      await store.set(`${SCHED_PREFIX}${id}`, sched);
    }
  },

  removeMedication: async (id: string): Promise<void> => {
    await store.remove(`${MED_PREFIX}${id}`);
    const index = await store.get<string[]>(MED_INDEX) || [];
    await store.set(MED_INDEX, index.filter(idx => idx !== id));
    
    // Also cleanup orphaned schedules
    const schedIdx = await store.get<string[]>(SCHED_INDEX) || [];
    for (const sid of schedIdx) {
      const s = await store.get<MedicationSchedule>(`${SCHED_PREFIX}${sid}`);
      if (s?.medicationId === id) {
        await store.remove(`${SCHED_PREFIX}${sid}`);
      }
    }
    await store.set(SCHED_INDEX, schedIdx.filter(async sid => {
       const s = await store.get<MedicationSchedule>(`${SCHED_PREFIX}${sid}`);
       return s?.medicationId !== id;
    }));
  }
};
