import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveOnboardingDraft, loadOnboardingDraft } from '../../lib/onboardingStore';
import { assertSafeCopy } from '../../lib/copyGuard';
import { outbox } from '../../lib/outbox';
import { useAuth } from '../../app/AuthProvider';

export const ProfileStep: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ageRange, setAgeRange] = useState('');
  const [diagnosisStatus, setDiagnosisStatus] = useState('');
  const [visitFreq, setVisitFreq] = useState('');

  useEffect(() => {
    loadOnboardingDraft().then(d => {
      if (d.profile) {
        setAgeRange(d.profile.ageRange || '');
        setDiagnosisStatus(d.profile.diagnosisStatus || '');
        setVisitFreq(d.profile.clinicVisitFrequency || '');
      }
    });
  }, []);

  const handleNext = async () => {
    const profileData = {
      age_range: ageRange,
      diagnosis_status: diagnosisStatus,
      clinic_visit_frequency: visitFreq
    };

    await saveOnboardingDraft({
      profile: {
        ageRange,
        diagnosisStatus,
        clinicVisitFrequency: visitFreq
      }
    });

    if (user) {
      await outbox.enqueue(user.id, {
        type: "UPSERT_PROFILE",
        id: user.id,
        createdAtISO: new Date().toISOString(),
        payload: profileData
      });
    }

    navigate('/onboarding/medications');
  };

  const Section = ({ title, options, value, onChange }: any) => (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{title}</h3>
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt: string) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-4 py-3 text-sm font-medium rounded-xl border transition-all ${
              value === opt 
                ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          {assertSafeCopy("Tell us a bit about you")}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          This helps us provide more relevant support.
        </p>
      </div>

      <div className="space-y-8">
        <Section 
          title="Age Range" 
          options={['18–24', '25–34', '35–44', '45–54', '55–64', '65+']} 
          value={ageRange} 
          onChange={setAgeRange} 
        />
        
        <Section 
          title="Diagnosis Status" 
          options={['Diagnosed', 'Newly diagnosed', 'Prefer not to say']} 
          value={diagnosisStatus} 
          onChange={setDiagnosisStatus} 
        />

        <Section 
          title="Clinic Visits" 
          options={['Monthly', 'Quarterly', 'Twice a year', 'Once a year', 'Not sure']} 
          value={visitFreq} 
          onChange={setVisitFreq} 
        />
      </div>

      <div className="pt-4">
        <button
          onClick={handleNext}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all min-h-[56px]"
        >
          Next
        </button>
      </div>
    </div>
  );
};
