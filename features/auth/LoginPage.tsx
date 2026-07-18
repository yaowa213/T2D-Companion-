import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { assertSafeCopy } from '../../lib/copyGuard';
import { AuthDebugPanel, OtpDiagnostic } from './AuthDebugPanel';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState(''); // Verification code
  const [step, setStep] = useState<'email' | 'token'>('email');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Diagnostic state for the debug panel
  const [lastOtpResult, setLastOtpResult] = useState<OtpDiagnostic | null>(null);

  const validateEmail = (e: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError(null);
    setStatusMessage("Sending code...");

    try {
      // EXACT OTP CALL as requested
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { shouldCreateUser: true, emailRedirectTo: origin }
      });

      // Capture diagnostic data
      const diagnostic: OtpDiagnostic = {
        ok: !error,
        status: error?.status || 200,
        errorMessage: error?.message || null,
        errorCode: error?.code || null,
        timestamp: new Date().toISOString()
      };
      setLastOtpResult(diagnostic);

      if (error) {
        // Log full error object in DEV only
        if ((import.meta as any).env?.DEV) {
          console.group("Supabase OTP Error (DEV)");
          console.error("Full Error Object:", error);
          console.error("Status:", error.status);
          console.error("Message:", error.message);
          console.groupEnd();
        }

        // Display error message and status in UI (aria-live)
        setError(`${error.message} (Status: ${error.status || 'unknown'})`);
        setStatusMessage(null);
      } else {
        setStep('token');
        setStatusMessage("Code sent! Check your inbox.");
      }
    } catch (err: any) {
      setError("A connection error occurred. Please try again.");
      setStatusMessage(null);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = token.trim();

    setLoading(true);
    setError(null);
    setStatusMessage("Verifying...");

    try {
      // EXACT VERIFY CALL as requested
      const { error } = await supabase.auth.verifyOtp({ 
        email: email.trim().toLowerCase(), 
        token: code, 
        type: "email" 
      });

      if (error) {
        if ((import.meta as any).env?.DEV) {
          console.error("Verification Failure:", error);
        }
        setError(`${error.message} (Status: ${error.status || 'unknown'})`);
        setStatusMessage(null);
      } else {
        navigate('/legal');
      }
    } catch (err: any) {
      setError("Verification failed due to a network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col p-6 animate-in fade-in duration-500">
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <header className="mb-12 text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center text-white shadow-lg">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
            {assertSafeCopy("Welcome back")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {step === 'email' 
              ? assertSafeCopy("Sign in securely with your email.") 
              : assertSafeCopy("Check your email for a 6-digit code.")}
          </p>
        </header>

        <form onSubmit={step === 'email' ? handleSendOtp : handleVerifyOtp} className="space-y-6">
          {step === 'email' ? (
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Email Address</label>
              <input
                id="email"
                type="email"
                required
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-lg transition-all"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label htmlFor="otp" className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Verification Code</label>
              <input
                id="otp"
                type="text"
                required
                disabled={loading}
                pattern="\d{6}"
                maxLength={6}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="000000"
                className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-[0.5em] font-bold transition-all"
              />
            </div>
          )}

          {/* ARIA-LIVE REGION FOR REAL-TIME FEEDBACK */}
          <div aria-live="polite" className="text-center min-h-[1.5rem] space-y-1">
            {statusMessage && <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">{statusMessage}</p>}
            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 font-bold rounded-2xl shadow-lg transition-all min-h-[56px] flex items-center justify-center ${
              loading 
                ? 'bg-blue-300 cursor-not-allowed text-white' 
                : 'bg-blue-600 text-white active:scale-95 hover:bg-blue-700'
            }`}
          >
            {loading ? "Processing..." : (step === 'email' ? "Send code" : "Verify")}
          </button>
        </form>

        {step === 'token' && (
          <button 
            disabled={loading}
            onClick={() => {
              setStep('email');
              setError(null);
              setStatusMessage(null);
            }}
            className="mt-6 text-blue-600 dark:text-blue-400 text-sm font-bold mx-auto hover:underline disabled:opacity-50"
          >
            Change email
          </button>
        )}

        {/* DEV-ONLY DEBUG PANEL */}
        <AuthDebugPanel lastResult={lastOtpResult} />
      </div>

      <footer className="pt-8 text-center mt-auto">
        <button 
          onClick={() => navigate('/welcome')}
          className="text-gray-400 text-sm font-medium hover:underline"
        >
          Back to start
        </button>
      </footer>
    </div>
  );
};