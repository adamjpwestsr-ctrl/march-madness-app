import { SupabaseClient } from '@supabase/supabase-js'

type MulliganRequest = {
  user_id: string
  game_id: number
  original_team: string
  replacement_team: string
}

export const request_mulligan = async (
  supabase: SupabaseClient,
  params: MulliganRequest
) => {
  const { user_id, game_id, original_team, replacement_team } = params

  const { data: used } = await supabase
    .from('mulligans_used')
    .select('*')
    .eq('user_id', user_id)

  // ...rest of your logic
}

