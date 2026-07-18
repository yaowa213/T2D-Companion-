import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')!
    // Access Deno via globalThis to avoid "Cannot find name 'Deno'" errors.
    const supabaseClient = createClient(
      (globalThis as any).Deno.env.get('SUPABASE_URL') ?? '',
      (globalThis as any).Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Admin client to delete auth user
    // Access Deno via globalThis to avoid "Cannot find name 'Deno'" errors.
    const adminClient = createClient(
      (globalThis as any).Deno.env.get('SUPABASE_URL') ?? '',
      (globalThis as any).Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) throw new Error('Unauthorized')

    const { confirmation } = await req.json()
    if (confirmation !== 'DELETE') throw new Error('Missing or incorrect confirmation token')

    const userId = user.id

    // Delete data from MVP tables (Order matters if foreign keys are strict)
    const tables = [
      'reminder_interactions',
      'medication_schedules',
      'medications',
      'daily_checkins',
      'appointments',
      'saved_questions',
      'user_legal_acceptances',
      'profiles'
    ]

    for (const table of tables) {
      const { error } = await adminClient
        .from(table)
        .delete()
        .eq('user_id', userId)
      
      if (error) console.error(`Failed to delete from ${table}:`, error)
    }

    // Finally, delete the auth user
    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(userId)
    if (deleteAuthError) throw deleteAuthError

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})