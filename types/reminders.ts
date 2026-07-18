export type Medication = {
  id: string;
  name: string;          // names only
  isActive: boolean;
  createdAtISO: string;
};

export type MedicationSchedule = {
  id: string;
  medicationId: string;
  timeLocal: string;     // "HH:MM"
  timezone: string;      // IANA, from Intl.DateTimeFormat().resolvedOptions().timeZone
  isActive: boolean;
  createdAtISO: string;
};

export type Appointment = {
  id: string;
  clinicName: string;
  appointmentAtISO: string;   // ISO timestamp
  status: "scheduled" | "attended" | "missed" | "reschedule_later";
  createdAtISO: string;
};

export type ReminderInteraction = {
  id: string;
  kind: "medication" | "appointment" | "habit";
  entityId: string | null;       // scheduleId or appointmentId
  scheduledForISO: string;        // ISO timestamp of the notification time
  action: "acknowledged" | "skipped" | "missed" | "opened";
  occurredAtISO: string;
};
