
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../app/AuthProvider';
import { legalCache } from '../lib/legalCache';
import { legalApi } from '../lib/legalApi';
import { getBypassActive } from '../lib/devBypass';

export const RequireLegal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [status, setStatus] = useState<'loading' | 'accepted' | 'needed'>('loading');

  useEffect(() => {
    if (!user) return;

    const checkStatus = async () => {
      // 1. Check Developer Bypass
      if (getBypassActive()) {
        setStatus('accepted');
        return;
      }

      // 2. Check Offline Cache first
      const cached = await legalCache.get(user.id);
      if (cached) {
        setStatus('accepted');
        return;
      }

      // 3. Check Supabase if Online
      if (navigator.onLine) {
        try {
          const acceptance = await legalApi.getActiveAcceptance(user.id);
          if (acceptance) {
            // Update cache since it was missing
            // Fix: Changed disclaimer_version_id to disclaimerVersion to match LegalCacheEntry interface
            await legalCache.set({
              userId: user.id,
              acceptedAtISO: acceptance.accepted_at,
              consentVersion: acceptance.consent_version_id,
              disclaimerVersion: acceptance.disclaimer_version_id
            });
            setStatus('accepted');
            return;
          }
        } catch (e) {
          console.error('Failed to check remote legal status', e);
        }
      }

      setStatus('needed');
    };

    checkStatus();
  }, [user]);

  if (status === 'loading') return null;
  if (status === 'needed') return <Navigate to="/legal" replace />;

  return <>{children}</>;
};
