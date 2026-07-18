import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveOnboardingDraft, loadOnboardingDraft } from '../../lib/onboardingStore';
import { assertSafeCopy } from '../../lib/copyGuard';
import { outbox } from '../../lib/outbox';
import { useAuth } from '../../app/AuthProvider';

export const MedicationsStep: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [meds, setMeds] = useState<Array<{ id: string; name: string; reminderTime: string }>>([]);
  const [newName, setNewName] = useState('');
  const [newTime, setNewTime] = useState('08:00');

  useEffect(() => {
    loadOnboardingDraft().then(d => {
      if (d.medications) setMeds(d.medications);
    });
  }, []);

  const addMed = async () => {
    if (!newName.trim()) return;
    const medId = crypto.randomUUID();
    const schedId = crypto.randomUUID();
    
    const newMed = { 
      id: medId, 
      name: newName.trim().slice(0, 50), 
      reminderTime: newTime 
    };
    
    const updated = [...meds, newMed];
    setMeds(updated);
    setNewName('');
    await saveOnboardingDraft({ medications: updated });

    if (user) {
      await outbox.enqueue(user.id, {
        type: "UPSERT_MEDICATION",
        id: medId,
        createdAtISO: new Date().toISOString(),
        payload: { id: medId, name: newMed.name }
      });
      await outbox.enqueue(user.id, {
        type: "UPSERT_MED_SCHEDULE",
        id: schedId,
        createdAtISO: new Date().toISOString(),
        payload: { id: schedId, medication_id: medId, time_local: newTime }
      });
    }
  };

  const removeMed = async (id: string) => {
    const updated = meds.filter(m => m.id !== id);
    setMeds(updated);
    await saveOnboardingDraft({ medications: updated });

    if (user) {
      await outbox.enqueue(user.id, {
        type: "DELETE_MEDICATION",
        id: id,
        createdAtISO: new Date().toISOString(),
        payload: {}
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          {assertSafeCopy("Your medication (optional)")}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Only enter the names of your medicine. Do not include dosage.
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 space-y-4 shadow-sm">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Medication Name</label>
            <input 
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Metformin"
              maxLength={50}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Reminder Time</label>
            <input 
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button 
            onClick={addMed}
            className="w-full py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold rounded-xl"
          >
            Add Medication
          </button>
        </div>

        {meds.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-500 uppercase px-1">Added Medications</h3>
            {meds.map(med => (
              <div key={med.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm">
                <div>
                  <p className="font-bold text-gray-800 dark:text-gray-100">{med.name}</p>
                  <p className="text-xs text-gray-500">{med.reminderTime}</p>
                </div>
                <button onClick={() => removeMed(med.id)} className="p-2 text-red-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-4 flex flex-col space-y-4">
        <button
          onClick={() => navigate('/onboarding/tone')}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all min-h-[56px]"
        >
          {meds.length > 0 ? "Next" : "Skip for now"}
        </button>
      </div>
    </div>
  );
};
