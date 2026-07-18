import { supabase } from './supabaseClient';

export interface LegalVersion {
  id: string;
  version_string: string;
  summary: string;
  effective_at: string;
}

export const legalApi = {
  getLatestConsent: async (): Promise<LegalVersion | null> => {
    const { data, error } = await supabase
      .from('consent_versions')
      .select('*')
      .order('effective_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  getLatestDisclaimer: async (): Promise<LegalVersion | null> => {
    const { data, error } = await supabase
      .from('disclaimer_versions')
      .select('*')
      .order('effective_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  getActiveAcceptance: async (userId: string) => {
    const { data, error } = await supabase
      .from('user_legal_acceptances')
      .select('*')
      .eq('user_id', userId)
      .is('revoked_at', null)
      .order('accepted_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  acceptLegal: async (userId: string, consentId: string, disclaimerId: string) => {
    const { error } = await supabase
      .from('user_legal_acceptances')
      .insert({
        user_id: userId,
        consent_version_id: consentId,
        disclaimer_version_id: disclaimerId,
        accepted_at: new Date().toISOString()
      });
    
    if (error) throw error;
  }
};
