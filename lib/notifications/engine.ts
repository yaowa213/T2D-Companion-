import { LocalNotifications, PermissionStatus } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { assertSafeCopy } from '../copyGuard';
import { Medication, MedicationSchedule, Appointment } from '../../types/reminders';
import { reminderInteractionsStore } from '../reminderInteractionsStore';
import { supabase } from '../supabaseClient';

const isNative = Capacitor.isNativePlatform();

export const notificationEngine = {
  requestPermissions: async (): Promise<PermissionStatus> => {
    try {
      return await LocalNotifications.requestPermissions();
    } catch (e) {
      console.warn('LocalNotifications.requestPermissions not supported on this platform', e);
      return { display: 'denied' } as PermissionStatus;
    }
  },

  checkPermissions: async (): Promise<PermissionStatus> => {
    try {
      return await LocalNotifications.checkPermissions();
    } catch (e) {
      console.warn('LocalNotifications.checkPermissions not supported on this platform', e);
      return { display: 'prompt' } as PermissionStatus;
    }
  },

  scheduleMedication: async (schedule: MedicationSchedule, med: Medication) => {
    if (!isNative) {
      console.info('Notification scheduling skipped: Not on a native platform.');
      return;
    }

    try {
      const [hour, minute] = schedule.timeLocal.split(':').map(Number);
      
      await LocalNotifications.schedule({
        notifications: [{
          id: schedule.id.split('-').reduce((a, b) => a + parseInt(b, 16), 0) % 2147483647,
          title: assertSafeCopy("Medication reminder"),
          body: assertSafeCopy("If you can, take your medication now. You can also skip."),
          schedule: {
            on: { hour, minute },
            repeats: true,
            allowWhileIdle: true,
          },
          extra: {
            kind: 'medication',
            scheduleId: schedule.id,
            medicationId: med.id
          },
          actionTypeId: 'MED_ACTIONS'
        }]
      });
    } catch (e) {
      console.error('Failed to schedule medication notification', e);
    }
  },

  scheduleAppointment: async (app: Appointment) => {
    if (!isNative) {
      console.info('Appointment notification scheduling skipped: Not on a native platform.');
      return;
    }

    try {
      const appDate = new Date(app.appointmentAtISO);
      const dayBefore = new Date(appDate.getTime() - 24 * 60 * 60 * 1000);
      const dayOf = new Date(appDate.getTime());
      dayOf.setHours(8, 0, 0, 0);

      const notifications = [];

      // 24h before
      if (dayBefore > new Date()) {
        notifications.push({
          id: (app.id.split('-').reduce((a, b) => a + parseInt(b, 16), 0) + 1) % 2147483647,
          title: assertSafeCopy("Clinic visit reminder"),
          body: assertSafeCopy("You have a clinic visit coming up tomorrow."),
          schedule: { at: dayBefore, allowWhileIdle: true },
          extra: { kind: 'appointment', appointmentId: app.id }
        });
      }

      // Day of
      if (dayOf > new Date()) {
        notifications.push({
          id: (app.id.split('-').reduce((a, b) => a + parseInt(b, 16), 0) + 2) % 2147483647,
          title: assertSafeCopy("Clinic visit reminder"),
          body: assertSafeCopy("You have a clinic visit today. You can update the status later."),
          schedule: { at: dayOf, allowWhileIdle: true },
          extra: { kind: 'appointment', appointmentId: app.id }
        });
      }

      if (notifications.length > 0) {
        await LocalNotifications.schedule({ notifications });
      }
    } catch (e) {
      console.error('Failed to schedule appointment notifications', e);
    }
  },

  cancel: async (id: string) => {
    if (!isNative) return;
    try {
      const numericId = id.split('-').reduce((a, b) => a + parseInt(b, 16), 0) % 2147483647;
      await LocalNotifications.cancel({ notifications: [{ id: numericId }] });
    } catch (e) {
      console.error('Failed to cancel notification', e);
    }
  }
};

// Initialize Action Types and Listeners only on Native Platforms
if (isNative) {
  try {
    LocalNotifications.registerActionTypes({
      types: [
        {
          id: 'MED_ACTIONS',
          actions: [
            { id: 'ACK', title: 'Done', foreground: true },
            { id: 'SKIP', title: 'Skip', foreground: true }
          ]
        }
      ]
    });

    LocalNotifications.addListener('localNotificationActionPerformed', async (action) => {
      const { kind, scheduleId, appointmentId } = action.notification.extra;
      
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      let interactionAction: 'acknowledged' | 'skipped' | 'opened' = 'opened';
      if (action.actionId === 'ACK') interactionAction = 'acknowledged';
      if (action.actionId === 'SKIP') interactionAction = 'skipped';

      await reminderInteractionsStore.logInteraction(session.user.id, {
        kind: kind as any,
        entityId: scheduleId || appointmentId,
        scheduledForISO: new Date().toISOString(),
        action: interactionAction
      });
    });
  } catch (e) {
    console.warn('Capacitor LocalNotifications registration failed', e);
  }
}
