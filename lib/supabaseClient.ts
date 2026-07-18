import { createClient } from '@supabase/supabase-js';
import { env } from './env';

const isValidConfig = env.SUPABASE_URL && env.SUPABASE_URL.startsWith('http') && env.SUPABASE_ANON_KEY;

/**
 * We initialize the Supabase client only if a valid URL is provided.
 * This prevents the SDK from throwing a synchronous "supabaseUrl is required" error.
 */
export const supabase = isValidConfig
  ? createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : new Proxy({} as any, {
      get: (target, prop) => {
        // Return a dummy auth object to prevent AuthProvider and LoginPage from crashing
        if (prop === 'auth') {
          return {
            getSession: async () => ({ data: { session: null }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
            signOut: async () => {},
            signInWithOtp: async () => ({ data: { user: null, session: null }, error: null }),
            verifyOtp: async () => ({ data: { user: null, session: null }, error: null }),
          };
        }
        // Return a function that returns a dummy promise for any other calls (e.g., .from())
        return () => ({
          select: () => ({ 
            eq: () => ({ 
              gte: () => ({ order: () => ({ limit: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }) }),
              order: () => ({ limit: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) })
            }),
            order: () => ({ limit: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }) 
          }),
          insert: async () => ({ error: new Error("Supabase not configured") }),
          upsert: async () => ({ error: new Error("Supabase not configured") }),
          update: () => ({ eq: () => ({ eq: async () => ({ error: new Error("Supabase not configured") }) }) }),
          delete: () => ({ eq: () => ({ eq: async () => ({ error: new Error("Supabase not configured") }) }) }),
          eq: () => ({ is: () => ({ order: () => ({ limit: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }) }) }),
        });
      }
    });