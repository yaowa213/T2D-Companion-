export const env = {
  SUPABASE_URL: (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) || (typeof process !== 'undefined' && (process.env as any)?.VITE_SUPABASE_URL) || "",
  SUPABASE_ANON_KEY: (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) || (typeof process !== 'undefined' && (process.env as any)?.VITE_SUPABASE_ANON_KEY) || "",
};

// Validation for development
if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
  console.warn("Supabase environment variables are missing. Auth and Legal features will be disabled until VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are provided.");
}
