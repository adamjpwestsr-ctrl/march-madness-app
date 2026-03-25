export const apply_mulligan = async (supabase, req) => {
  const { user_id, game_id, original_team, replacement_team } = req;

  // 1. Update the losing game pick
  await supabase
    .from('picks')
    .update({
      pick: replacement_team,
      is_mulligan: true
    })
    .eq('user_id', user_id)
    .eq('game_id', game_id);

  // 2. Get all downstream games
  const { data: downstream } = await supabase.rpc('get_downstream_games', {
    game_id
  });

  // 3. Rewrite only where user originally advanced the team
  for (const g of downstream) {
    const { data: p } = await supabase
      .from('picks')
      .select('pick')
      .eq('user_id', user_id)
      .eq('game_id', g.game_id)
      .single();

    if (p && p.pick === original_team) {
      await supabase
        .from('picks')
        .update({
          pick: replacement_team,
          is_mulligan: true
        })
        .eq('user_id', user_id)
        .eq('game_id', g.game_id);
    }
  }
};
