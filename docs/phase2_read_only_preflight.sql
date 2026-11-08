-- READ ONLY: identify bracket ownership and related test data before preparing a reset.
-- This query does not delete or modify anything. Review sport values before any DELETE.
SELECT
  sport,
  COUNT(*) AS bracket_count
FROM public.brackets
GROUP BY sport
ORDER BY sport NULLS FIRST;

-- Per-bracket game/pick footprint. Compare this with the five audited V2 bracket IDs.
SELECT
  b.bracket_id,
  b.bracket_name,
  b.sport,
  COUNT(DISTINCT g.id) AS tournament_game_rows,
  COUNT(DISTINCT p.game_id) AS games_with_picks,
  COUNT(DISTINCT p.game_id) FILTER (WHERE p.picked_team IS NOT NULL) AS games_with_selected_team
FROM public.brackets b
LEFT JOIN public.tournament_games g ON g.bracket_id = b.bracket_id
LEFT JOIN public.bracket_picks p ON p.bracket_id = b.bracket_id
GROUP BY b.bracket_id, b.bracket_name, b.sport
ORDER BY b.created_at, b.bracket_name;

-- Per-bracket V2 cache footprint, so reset scope can be narrow.
SELECT 'mm_scores_v2' AS source_table, bracket_id::text, COUNT(*) AS row_count
FROM public.mm_scores_v2
GROUP BY bracket_id
UNION ALL
SELECT 'bracket_leaderboard' AS source_table, bracket_id::text, COUNT(*) AS row_count
FROM public.bracket_leaderboard
GROUP BY bracket_id
ORDER BY source_table, bracket_id;

-- Shared official tree footprint; the expected total is 75 once setup is complete.
SELECT round, COUNT(*) AS game_count
FROM public.tournament_games
WHERE bracket_id IS NULL
GROUP BY round
ORDER BY round;
