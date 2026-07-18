import React, { useState, useEffect } from 'react';
import { medsStore } from '../../lib/medsStore';
import { appointmentsStore } from '../../lib/appointmentsStore';
import { reminderInteractionsStore } from '../../lib/reminderInteractionsStore';
import { Medication, MedicationSchedule, Appointment, ReminderInteraction } from '../../types/reminders';
import { NotificationsPermissionCard } from './NotificationsPermissionCard';
import { notificationEngine } from '../../lib/notifications/engine';

export const RemindersPage: React.FC = () => {
  const [tab, setTab] = useState<'meds' | 'appointments'>('meds');
  const [meds, setMeds] = useState<Medication[]>([]);
  const [schedules, setSchedules] = useState<MedicationSchedule[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [interactions, setInteractions] = useState<ReminderInteraction[]>([]);
  
  const [showAddMed, setShowAddMed] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newMedTime, setNewMedTime] = useState('08:00');

  const [showAddApp, setShowAddApp] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [newAppDate, setNewAppDate] = useState('');

  const refresh = async () => {
    const data = await medsStore.listAll();
    const apps = await appointmentsStore.list();
    const ints = await reminderInteractionsStore.listRecent(5);
    setMeds(data.medications);
    setSchedules(data.schedules);
    setAppointments(apps);
    setInteractions(ints);
  };

  useEffect(() => { refresh(); }, []);

  const handleAddMed = async () => {
    if (!newMedName) return;
    const med = await medsStore.addMedication(newMedName);
    const sched = await medsStore.addSchedule(med.id, newMedTime);
    await notificationEngine.scheduleMedication(sched, med);
    setNewMedName('');
    setShowAddMed(false);
    refresh();
  };

  const handleAddApp = async () => {
    if (!newAppName || !newAppDate) return;
    const app = await appointmentsStore.add(newAppName, new Date(newAppDate).toISOString());
    await notificationEngine.scheduleAppointment(app);
    setNewAppName('');
    setNewAppDate('');
    setShowAddApp(false);
    refresh();
  };

  const toggleSched = async (id: string, current: boolean) => {
    await medsStore.toggleSchedule(id, !current);
    if (!current) {
      const s = schedules.find(x => x.id === id);
      const m = meds.find(x => x.id === s?.medicationId);
      if (s && m) await notificationEngine.scheduleMedication(s, m);
    } else {
      await notificationEngine.cancel(id);
    }
    refresh();
  };

  return (
    <div className="space-y-6 pb-12">
      <NotificationsPermissionCard />

      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
        <button 
          onClick={() => setTab('meds')}
          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${tab === 'meds' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}
        >
          Medication
        </button>
        <button 
          onClick={() => setTab('appointments')}
          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${tab === 'appointments' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}
        >
          Appointments
        </button>
      </div>

      {tab === 'meds' ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest px-1">Your Medications</h3>
            <button 
              onClick={() => setShowAddMed(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md"
            >
              + Add New
            </button>
          </div>

          <div className="space-y-3">
            {schedules.map(sched => {
              const med = meds.find(m => m.id === sched.medicationId);
              return (
                <div key={sched.id} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-5 rounded-3xl shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-bold text-gray-900 dark:text-white">{med?.name}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-bold">{sched.timeLocal}</p>
                  </div>
                  <button 
                    onClick={() => toggleSched(sched.id, sched.isActive)}
                    className={`w-14 h-8 rounded-full relative transition-colors ${sched.isActive ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${sched.isActive ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
              );
            })}
            {schedules.length === 0 && (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                <p className="text-gray-400 text-sm">No medications added yet.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest px-1">Clinic Visits</h3>
            <button 
              onClick={() => setShowAddApp(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md"
            >
              + Add Appointment
            </button>
          </div>

          <div className="space-y-4">
            {appointments.map(app => (
              <div key={app.id} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-5 rounded-3xl shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{app.clinicName}</p>
                    <p className="text-sm text-gray-500">{new Date(app.appointmentAtISO).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  </div>
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-1 rounded-full ${
                    app.status === 'scheduled' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                  }`}>
                    {app.status}
                  </span>
                </div>
                {new Date(app.appointmentAtISO) < new Date() && app.status === 'scheduled' && (
                  <div className="pt-4 border-t border-gray-50 dark:border-gray-700 mt-3 flex space-x-2">
                    <button 
                      onClick={() => { appointmentsStore.updateStatus(app.id, 'attended'); refresh(); }}
                      className="flex-1 py-2 bg-green-50 text-green-700 text-xs font-bold rounded-lg"
                    >
                      Attended
                    </button>
                    <button 
                      onClick={() => { appointmentsStore.updateStatus(app.id, 'missed'); refresh(); }}
                      className="flex-1 py-2 bg-red-50 text-red-700 text-xs font-bold rounded-lg"
                    >
                      Missed
                    </button>
                  </div>
                )}
              </div>
            ))}
             {appointments.length === 0 && (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                <p className="text-gray-400 text-sm">No upcoming appointments.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Interactions Log */}
      <section className="mt-12 space-y-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Recent Activity</h3>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-4 space-y-2">
          {interactions.map(int => (
            <div key={int.id} className="flex items-center justify-between py-2 text-xs border-b border-gray-100 dark:border-gray-700 last:border-0">
              <div className="flex items-center space-x-2">
                 <span className={`w-2 h-2 rounded-full ${int.action === 'acknowledged' ? 'bg-green-500' : 'bg-gray-300'}`} />
                 <span className="text-gray-600 dark:text-gray-300 capitalize">{int.kind} - {int.action}</span>
              </div>
              <span className="text-gray-400">{new Date(int.occurredAtISO).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          ))}
          {interactions.length === 0 && <p className="text-center text-gray-400 text-[10px] py-4">No recent activity logged.</p>}
        </div>
      </section>

      {/* Modals */}
      {showAddMed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 w-full rounded-3xl p-6 space-y-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-xl font-bold">Add Medication</h3>
            <div className="space-y-4">
              <input 
                type="text" placeholder="Name (e.g. Metformin)" 
                value={newMedName} onChange={e => setNewMedName(e.target.value)}
                className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input 
                type="time" value={newMedTime} onChange={e => setNewMedTime(e.target.value)}
                className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 rounded-2xl outline-none"
              />
            </div>
            <div className="flex space-x-3 pt-4">
              <button onClick={() => setShowAddMed(false)} className="flex-1 py-4 font-bold text-gray-500">Cancel</button>
              <button onClick={handleAddMed} className="flex-2 bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg">Save</button>
            </div>
          </div>
        </div>
      )}

      {showAddApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 w-full rounded-3xl p-6 space-y-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-xl font-bold">New Appointment</h3>
            <div className="space-y-4">
              <input 
                type="text" placeholder="Clinic Name" 
                value={newAppName} onChange={e => setNewAppName(e.target.value)}
                className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 rounded-2xl outline-none"
              />
              <input 
                type="datetime-local" value={newAppDate} onChange={e => setNewAppDate(e.target.value)}
                className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 rounded-2xl outline-none"
              />
            </div>
            <div className="flex space-x-3 pt-4">
              <button onClick={() => setShowAddApp(false)} className="flex-1 py-4 font-bold text-gray-500">Cancel</button>
              <button onClick={handleAddApp} className="flex-2 bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
