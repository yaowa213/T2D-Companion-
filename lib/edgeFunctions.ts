import { supabase } from './supabaseClient';
import { env } from './env';

export const edgeFunctions = {
  invoke: async (functionName: string, body?: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Authentication required");

    const response = await fetch(`${env.SUPABASE_URL}/functions/v1/${functionName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || `Failed to call ${functionName}`);
    }

    return response;
  }
};
