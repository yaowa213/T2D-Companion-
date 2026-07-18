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
    // Access Deno via globalThis to avoid "Cannot find name 'Deno'" errors.
    const supabaseClient = createClient(
      (globalThis as any).Deno.env.get('SUPABASE_URL') ?? '',
      (globalThis as any).Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) throw new Error('Unauthorized')

    // Tables to export
    const tables = [
      'profiles',
      'user_legal_acceptances',
      'daily_checkins',
      'medications',
      'medication_schedules',
      'appointments',
      'reminder_interactions',
      'saved_questions'
    ]

    const exportData: Record<string, any> = {
      user_id: user.id,
      exported_at: new Date().toISOString(),
      data: {}
    }

    for (const table of tables) {
      const { data, error } = await supabaseClient
        .from(table)
        .select('*')
        .limit(1000)
      
      if (error) {
        console.error(`Error fetching ${table}:`, error)
        exportData.data[table] = { error: 'Failed to fetch data' }
      } else {
        exportData.data[table] = data
      }
    }

    return new Response(
      JSON.stringify(exportData, null, 2),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="t2d-companion-export-${user.id.slice(0, 8)}.json"`
        },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})