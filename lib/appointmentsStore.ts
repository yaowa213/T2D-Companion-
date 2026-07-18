import { store } from './store';
import { Appointment } from '../types/reminders';

const APP_PREFIX = 'appointment:';
const APP_INDEX = 'appointmentsIndex';

export const appointmentsStore = {
  add: async (clinicName: string, appointmentAtISO: string): Promise<Appointment> => {
    const app: Appointment = {
      id: crypto.randomUUID(),
      clinicName: clinicName.slice(0, 60),
      appointmentAtISO,
      status: 'scheduled',
      createdAtISO: new Date().toISOString()
    };
    await store.set(`${APP_PREFIX}${app.id}`, app);
    const index = await store.get<string[]>(APP_INDEX) || [];
    await store.set(APP_INDEX, [...index, app.id]);
    return app;
  },

  list: async (): Promise<Appointment[]> => {
    const index = await store.get<string[]>(APP_INDEX) || [];
    const results = await Promise.all(index.map(id => store.get<Appointment>(`${APP_PREFIX}${id}`)));
    return results.filter((a): a is Appointment => a !== null)
      .sort((a, b) => a.appointmentAtISO.localeCompare(b.appointmentAtISO));
  },

  updateStatus: async (id: string, status: Appointment['status']): Promise<void> => {
    const app = await store.get<Appointment>(`${APP_PREFIX}${id}`);
    if (app) {
      app.status = status;
      await store.set(`${APP_PREFIX}${id}`, app);
    }
  }
};
