import { SupabaseClient } from '@supabase/supabase-js'

type ApplyMulliganRequest = {
  user_id: string
  game_id: number
  original_team: string
  replacement_team: string
}

export const apply_mulligan = async (
  supabase: SupabaseClient,
  req: ApplyMulliganRequest
) => {
  const { user_id, game_id, original_team, replacement_team } = req

  // 1. Update the losing game pick
  await supabase
    .from('picks')
    .update({ selected_team: replacement_team })
    .eq('user_id', user_id)
    .eq('game_id', game_id)

  // 2. Mark mulligan as used
  await supabase
    .from('mulligans_used')
    .insert({
      user_id,
      game_id,
      original_team,
      replacement_team
    })

  return { success: true }
}
