export type Feeling = "low" | "okay" | "good" | "skip";
export type MedTaken = "yes" | "not_yet" | "skip";

export interface DailyCheckin {
  id: string;
  occurredAtISO: string;         // ISO timestamp
  dayKey: string;                // YYYY-MM-DD in local timezone
  feeling: Feeling | null;
  medTaken: MedTaken | null;
  note: string | null;           // <= 280 chars
  createdAtISO: string;
}
