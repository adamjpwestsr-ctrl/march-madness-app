-- READ ONLY: inspect the shared official March Madness V2 tree.
-- Expected counts: round 0=12, 1=32, 2=16, 3=8, 4=4, 5=2, 6=1; total=75.
-- Do not use this query as a substitute for reviewing team slots/destination links.
SELECT
  round,
  COUNT(*) AS game_count,
  COUNT(*) FILTER (WHERE winner_to_game_id IS NOT NULL) AS games_with_destination,
  COUNT(*) FILTER (WHERE team1_id IS NOT NULL) AS populated_team1_slots,
  COUNT(*) FILTER (WHERE team2_id IS NOT NULL) AS populated_team2_slots
FROM public.tournament_games
WHERE bracket_id IS NULL
GROUP BY round
ORDER BY round;

SELECT COUNT(*) AS shared_tree_total
FROM public.tournament_games
WHERE bracket_id IS NULL;
