import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assertSafeCopy } from '../../lib/copyGuard';
import { legalApi, LegalVersion } from '../../lib/legalApi';
import { legalCache } from '../../lib/legalCache';
import { useAuth } from '../../app/AuthProvider';
import { auditLocal } from '../../lib/auditLocal';
import { Modal } from '../../components/Modal';

export const LegalPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [consentChecked, setConsentChecked] = useState(false);
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [versions, setVersions] = useState<{ consent: LegalVersion | null; disclaimer: LegalVersion | null }>({ consent: null, disclaimer: null });
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    if (!navigator.onLine) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const [c, d] = await Promise.all([
          legalApi.getLatestConsent(),
          legalApi.getLatestDisclaimer()
        ]);
        setVersions({ consent: c, disclaimer: d });
      } catch (e) {
        console.error('Error loading legal versions', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleComplete = async () => {
    if (!user || !versions.consent || !versions.disclaimer) return;
    
    setLoading(true);
    try {
      await legalApi.acceptLegal(user.id, versions.consent.id, versions.disclaimer.id);
      
      await legalCache.set({
        userId: user.id,
        acceptedAtISO: new Date().toISOString(),
        consentVersion: versions.consent.id,
        disclaimerVersion: versions.disclaimer.id
      });

      await auditLocal('legal_accepted', { 
        userId: user.id,
        consentId: versions.consent.id,
        disclaimerId: versions.disclaimer.id
      });
      
      navigate('/onboarding');
    } catch (e) {
      console.error('Failed to accept legal terms', e);
      alert("Error saving your choice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-12 text-center animate-pulse">Loading terms...</div>;

  if (isOffline) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col p-6 items-center justify-center text-center space-y-6">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h1 className="text-xl font-bold">{assertSafeCopy("Connect once to finish setup")}</h1>
        <p className="text-gray-500 text-sm">
          We need to verify your health data choices with our secure system. Please connect to the internet to continue.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl"
        >
          Check Connection
        </button>
      </div>
    );
  }

  const StepOne = (
    <div className="space-y-6 animate-in fade-in duration-300">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {assertSafeCopy("Your privacy matters")}
      </h1>
      
      <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
        <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
          {versions.consent?.summary || "We respect your data privacy."}
        </p>
      </div>

      <label className="flex items-start space-x-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer min-h-[56px]">
        <input 
          type="checkbox" 
          checked={consentChecked} 
          onChange={(e) => setConsentChecked(e.target.checked)}
          className="mt-1 w-6 h-6 rounded border-gray-300 text-blue-600"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
          I agree to the privacy policy (v{versions.consent?.version_string}).
        </span>
      </label>
    </div>
  );

  const StepTwo = (
    <div className="space-y-6 animate-in fade-in duration-300">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {assertSafeCopy("Important Disclaimer")}
      </h1>
      
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
        <p className="font-bold mb-2">Support, not advice.</p>
        <p>
          {versions.disclaimer?.summary || "This app provides health support but is not a medical provider."}
        </p>
      </div>

      <label className="flex items-start space-x-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer min-h-[56px]">
        <input 
          type="checkbox" 
          checked={disclaimerChecked} 
          onChange={(e) => setDisclaimerChecked(e.target.checked)}
          className="mt-1 w-6 h-6 rounded border-gray-300 text-blue-600"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
          I understand the disclaimer (v{versions.disclaimer?.version_string}).
        </span>
      </label>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col p-6">
      <div className="flex-1 overflow-y-auto">
        <div className="flex space-x-1 mb-8">
          <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-800'}`} />
          <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-800'}`} />
        </div>

        {step === 1 ? StepOne : StepTwo}
      </div>

      <div className="pt-6 space-y-4">
        <button
          onClick={() => {
            if (step === 1 && consentChecked) setStep(2);
            else if (step === 2 && disclaimerChecked) handleComplete();
          }}
          disabled={loading || (step === 1 ? !consentChecked : !disclaimerChecked)}
          className={`w-full font-bold py-4 rounded-xl transition-all min-h-[56px] shadow-lg ${
            (step === 1 ? consentChecked : disclaimerChecked)
              ? 'bg-blue-600 text-white active:scale-95' 
              : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
          }`}
        >
          {loading ? "Saving..." : (step === 1 ? "Next" : "Finish")}
        </button>
      </div>
    </div>
  );
};
