import React, { useState, useEffect } from 'react';
import { assertSafeCopy } from '../../lib/copyGuard';
import { useAuth } from '../../app/AuthProvider';
import { supabaseVisitPrepApi } from '../../lib/supabaseVisitPrepApi';
import { visitPrepCache } from '../../lib/visitPrepCache';
import { questionsStore, SavedQuestion } from '../../lib/questionsStore';
import { generateVisitSummary, SummaryOutput } from '../../lib/visitPrepSummary';
import { store } from '../../lib/store';

export const VisitPrepPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SummaryOutput | null>(null);
  const [questions, setQuestions] = useState<SavedQuestion[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [personalNote, setPersonalNote] = useState('');
  const [showToast, setShowToast] = useState(false);

  const NOTE_KEY = (uid: string) => `visitprep_note:${uid}`;

  const loadData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // 1. Load discussion note
      const savedNote = await store.get<string>(NOTE_KEY(user.id)) || '';
      setPersonalNote(savedNote);

      // 2. Load Questions from local store (Offline First)
      const localQs = await questionsStore.list(user.id);
      setQuestions(localQs);

      // 3. Try to fetch fresh data if online
      if (navigator.onLine) {
        const [checkins, interactions, remoteQs] = await Promise.all([
          supabaseVisitPrepApi.listCheckinsLastNDays(user.id),
          supabaseVisitPrepApi.listMedicationInteractionsLastNDays(user.id),
          supabaseVisitPrepApi.listSavedQuestions(user.id)
        ]);

        const genSummary = generateVisitSummary(checkins, interactions, remoteQs);
        setSummary(genSummary);
        
        // Update local stores/cache
        await visitPrepCache.set(user.id, { checkins, interactions, questions: remoteQs });
      } else {
        // Load from Cache if offline
        const cached = await visitPrepCache.get(user.id);
        if (cached) {
          const genSummary = generateVisitSummary(cached.checkins, cached.interactions, cached.questions);
          setSummary(genSummary);
        }
      }
    } catch (err) {
      console.error('Failed to load visit prep data', err);
      // Fallback to cache if error
      if (user) {
        const cached = await visitPrepCache.get(user.id);
        if (cached) {
          const genSummary = generateVisitSummary(cached.checkins, cached.interactions, cached.questions);
          setSummary(genSummary);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleAddQuestion = async () => {
    if (!user || !newQuestion.trim()) return;
    try {
      await questionsStore.add(user.id, newQuestion.trim());
      setNewQuestion('');
      const updated = await questionsStore.list(user.id);
      setQuestions(updated);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!user) return;
    await questionsStore.delete(user.id, id);
    const updated = await questionsStore.list(user.id);
    setQuestions(updated);
  };

  const handleSaveNote = async () => {
    if (!user) return;
    await store.set(NOTE_KEY(user.id), personalNote.slice(0, 500));
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleCopySummary = () => {
    if (!summary) return;

    const questionsList = questions.map(q => `- ${q.question}`).join('\n');
    const text = [
      ...summary.friendlySummaryLines,
      "",
      "Questions for my doctor:",
      questionsList || "None saved",
      "",
      "My private discussion notes:",
      personalNote || "None"
    ].join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    });
  };

  if (loading && !summary) return <div className="p-12 text-center animate-pulse">Preparing your summary...</div>;

  return (
    <div className="space-y-8 pb-12">
      <header className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Visit Preparation
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg border border-gray-100 dark:border-gray-700">
          {assertSafeCopy("For your own reference. Not medical advice.")}
        </p>
      </header>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 gap-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-5 rounded-3xl shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recent Activity (14 Days)</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/10 rounded-2xl">
              <span className="text-sm text-gray-700 dark:text-gray-300">Missed/Skipped Meds</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{summary?.missedMedsCount14d || 0}</span>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-900/30 rounded-2xl space-y-2">
              <p className="text-xs text-gray-400 font-bold uppercase">Feeling Trends</p>
              <div className="flex justify-around text-center">
                <div>
                  <p className="text-xs text-gray-500">Good</p>
                  <p className="font-bold text-green-600">{summary?.feelingCounts14d.good || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Okay</p>
                  <p className="font-bold text-blue-600">{summary?.feelingCounts14d.okay || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Low</p>
                  <p className="font-bold text-amber-600">{summary?.feelingCounts14d.low || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Saved Questions */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest px-1">Questions for Visit</h3>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm space-y-4">
          <div className="flex space-x-2">
            <input 
              type="text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value.slice(0, 200))}
              placeholder="e.g. Side effects?"
              className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              onClick={handleAddQuestion}
              className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs"
            >
              Add
            </button>
          </div>

          <ul className="space-y-2">
            {questions.map(q => (
              <li key={q.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <span className="text-sm text-gray-800 dark:text-gray-200">{q.question}</span>
                <button 
                  onClick={() => handleDeleteQuestion(q.id)}
                  className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </li>
            ))}
            {questions.length === 0 && (
              <p className="text-center text-xs text-gray-400 py-4">No questions saved yet.</p>
            )}
          </ul>
        </div>
      </section>

      {/* Discussion Notes */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Private Notes</h3>
          <span className="text-[10px] text-gray-400">{500 - personalNote.length} remaining</span>
        </div>
        <textarea
          value={personalNote}
          onChange={(e) => setPersonalNote(e.target.value.slice(0, 500))}
          placeholder="Things you want to discuss but not necessarily as a formal question..."
          className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl min-h-[120px] outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
        />
        <button 
          onClick={handleSaveNote}
          className="w-full py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl text-xs"
        >
          Save Notes Locally
        </button>
      </section>

      <section className="pt-4">
        <button 
          onClick={handleCopySummary}
          className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-7 4h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <span>Copy Visit Summary</span>
        </button>
      </section>

      {showToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full text-sm font-bold shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 z-50">
          Saved and Copied to Clipboard
        </div>
      )}
    </div>
  );
};