import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export type FeedItem = {
  id: string;
  type: "pick" | "score";
  timestamp: string;
  userName: string;
  teamName?: string;
  points?: number;
};

export async function generateFeedActivity(groupId: string) {
  const supabase = await createSupabaseServerClient();

  const { data: picks } = await supabase
    .from("mm_picks")
    .select("id, user_id, game_id, selected_team_id, created_at")
    .eq("group_id", groupId);

  const { data: scores } = await supabase
    .from("mm_scores")
    .select("user_id, score, updated_at")
    .eq("group_id", groupId);

  // FIX: give feed a real type
  const feed: FeedItem[] = [];

  picks?.forEach((p) => {
    feed.push({
      id: p.id,
      type: "pick",
      timestamp: p.created_at,
      userName: p.user_id,
      teamName: p.selected_team_id,
    });
  });

  scores?.forEach((s) => {
    feed.push({
      id: `${s.user_id}-${s.updated_at}`,
      type: "score",
      timestamp: s.updated_at,
      userName: s.user_id,
      points: s.score,
    });
  });

  return feed.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}
