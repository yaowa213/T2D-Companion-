import React from 'react';
import { env } from '../../lib/env';

export interface OtpDiagnostic {
  ok: boolean;
  status: number | string;
  errorMessage: string | null;
  errorCode: string | null;
  timestamp: string;
}

interface AuthDebugPanelProps {
  lastResult: OtpDiagnostic | null;
}

export const AuthDebugPanel: React.FC<AuthDebugPanelProps> = ({ lastResult }) => {
  // Only render in development mode
  if (!(import.meta as any).env?.DEV) return null;

  return (
    <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-[10px] font-mono text-gray-500 space-y-2 shadow-inner">
      <div className="flex justify-between items-center mb-1">
        <p className="font-bold uppercase text-gray-400 text-[8px] tracking-widest">Auth Diagnostics (DEV ONLY)</p>
      </div>
      
      <div className="space-y-1">
        <p>VITE_SUPABASE_URL set: <span className={env.SUPABASE_URL ? 'text-green-600' : 'text-red-600 font-bold'}>{env.SUPABASE_URL ? 'YES' : 'NO'}</span></p>
        <p>VITE_SUPABASE_ANON_KEY set: <span className={env.SUPABASE_ANON_KEY ? 'text-green-600' : 'text-red-600 font-bold'}>{env.SUPABASE_ANON_KEY ? 'YES' : 'NO'}</span></p>
        <p>window.location.origin: <span className="text-gray-700 dark:text-gray-300">{window.location.origin}</span></p>
      </div>

      {lastResult && (
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <p className="font-bold text-gray-400 mb-1 underline">Last Send Attempt</p>
          <p>Timestamp: <span className="text-gray-400">{lastResult.timestamp}</span></p>
          <p>Status Code: <span className={lastResult.ok ? 'text-green-600' : 'text-red-600 font-bold'}>{lastResult.status}</span></p>
          {lastResult.errorMessage && (
            <div className="mt-1 p-1 bg-red-50 dark:bg-red-950/20 rounded border border-red-100 dark:border-red-900/30">
              <p className="text-red-500">Error Message: {lastResult.errorMessage}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};