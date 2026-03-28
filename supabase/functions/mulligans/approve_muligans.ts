import { SupabaseClient } from '@supabase/supabase-js'

type RequestMulliganParams = {
  user_id: string
  game_id: number
  original_team: string
  replacement_team: string
}

export const request_mulligan = async (
  supabase: SupabaseClient,
  params: RequestMulliganParams
) => {
  const { user_id, game_id, original_team, replacement_team } = params

  // Check mulligans remaining
  const { data: used } = await supabase
    .from('mulligans_used')
    .select('used')
    .eq('user_id', user_id)
    .single()

  if (used && used.used >= 2) {
    return { error: 'No mulligans remaining' }
  }

  // Insert request
  const { data, error } = await supabase
    .from('mulligan_requests')
    .insert({
      user_id,
      game_id,
      original_team,
      replacement_team,
      status: 'pending'
    })
    .select()
    .single()

  return { data, error }
}
