import { assertSafeCopy } from './copyGuard';

export interface SummaryOutput {
  missedMedsCount14d: number;
  feelingCounts14d: { low: number; okay: number; good: number; skip: number };
  questions: { id: string; question: string }[];
  friendlySummaryLines: string[];
}

export const generateVisitSummary = (
  checkins: any[],
  interactions: any[],
  questions: any[]
): SummaryOutput => {
  const missedMeds = interactions.filter(i => i.action === 'missed' || i.action === 'skipped').length;
  
  const feelings = { low: 0, okay: 0, good: 0, skip: 0 };
  checkins.forEach(c => {
    if (c.feeling && feelings.hasOwnProperty(c.feeling)) {
      feelings[c.feeling as keyof typeof feelings]++;
    }
  });

  const lines = [
    assertSafeCopy("Here is a simple summary for your reference during your visit."),
    assertSafeCopy(`Medication reminders missed or skipped (14 days): ${missedMeds}`),
    assertSafeCopy(`Feeling check-ins (14 days): Low ${feelings.low} • Okay ${feelings.okay} • Good ${feelings.good}`),
    assertSafeCopy(`Questions you have saved: ${questions.length}`)
  ];

  return {
    missedMedsCount14d: missedMeds,
    feelingCounts14d: feelings,
    questions: questions.map(q => ({ id: q.id, question: q.question })),
    friendlySummaryLines: lines
  };
};