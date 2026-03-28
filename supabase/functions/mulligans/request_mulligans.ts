import { SupabaseClient } from '@supabase/supabase-js'

export const request_mulligan = async (
  supabase: SupabaseClient,
  {
    user_id,
    game_id,
    original_team,
    replacement_team
  }: {
    user_id: string
    game_id: number
    original_team: string
    replacement_team: string
  }
) => {
  // Check mulligans remaining
  const { data: used } = await supabase
    .from('mulligans_used')
    .select('*')
    .eq('user_id', user_id)

  // ...rest of your logic
}
