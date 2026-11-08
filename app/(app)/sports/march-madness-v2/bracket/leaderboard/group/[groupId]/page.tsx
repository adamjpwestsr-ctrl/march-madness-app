import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

type GroupScoreRow = {
  user_id: string;
  bracket_id: string;
  total_score: number;
  correct_picks: number;
  points_by_round: Record<string, number> | null;
  brackets: {
    bracket_name: string;
  }[] | null;
  users: {
    email: string;
    full_name: string | null;
  }[] | null;
};

export default async function GroupLeaderboardPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Load group info
  const { data: group, error: groupErr } = await supabase
    .from("mm_groups")
    .select("*")
    .eq("id", groupId)
    .single();

  if (groupErr || !group) {
    return (
      <div className="p-8 text-red-400">
        Group not found.
      </div>
    );
  }

  // Load brackets in this group
  const { data: groupBrackets, error: gbErr } = await supabase
    .from("mm_group_brackets")
    .select("bracket_id")
    .eq("group_id", groupId);

  if (gbErr) {
    console.error("Group brackets load error:", gbErr);
    return (
      <div className="p-8 text-red-400">
        Failed to load group brackets.
      </div>
    );
  }

  const bracketIds = groupBrackets?.map((gb) => gb.bracket_id) ?? [];

  if (bracketIds.length === 0) {
    return (
      <div className="p-8 bg-slate-900 min-h-screen text-gray-100">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">
            Group Leaderboard: {group.group_name}
          </h1>
          <Link
            href={`/sports/march-madness-v2/bracket/group/${groupId}`}
            className="px-4 py-2 rounded-lg bg-blue-500 text-black font-semibold hover:bg-blue-400"
          >
            Group Page
          </Link>
        </div>
        <div className="text-gray-300">
          No brackets have been submitted to this group yet.
        </div>
      </div>
    );
  }

  // Load scores for brackets in this group
  const { data: scores, error: scoresErr } = await supabase
    .from("mm_scores_v2")
    .select(
      `
      user_id,
      bracket_id,
      total_score,
      correct_picks,
      points_by_round,
      brackets ( bracket_name ),
      users ( email, full_name )
    `
    )
    .in("bracket_id", bracketIds)
    .order("total_score", { ascending: false });

  if (scoresErr) {
    console.error("Group leaderboard load error:", scoresErr);
    return (
      <div className="p-8 text-red-400">
        Failed to load group leaderboard.
      </div>
    );
  }

  const rows: GroupScoreRow[] = scores ?? [];

  return (
    <div className="p-8 bg-slate-900 min-h-screen text-gray-100">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">
          Group Leaderboard: {group.group_name}
        </h1>

        <div className="flex gap-3">
          <Link
            href={`/sports/march-madness-v2/bracket/group/${groupId}`}
            className="px-4 py-2 rounded-lg bg-blue-500 text-black font-semibold hover:bg-blue-400"
          >
            Group Page
          </Link>
          <Link
            href="/sports/march-madness-v2/bracket/leaderboard/global"
            className="px-4 py-2 rounded-lg bg-slate-700 text-gray-100 font-semibold hover:bg-slate-600"
          >
            Global Leaderboard
          </Link>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="text-gray-300">
          No scored brackets in this group yet.
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((row, index) => {
            const bracket = row.brackets?.[0];
            const profile = row.users?.[0];

            return (
              <div
                key={row.bracket_id}
                className="bg-slate-800 border border-slate-700 rounded-xl p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">
                      #{index + 1} — {bracket?.bracket_name ?? "Unnamed Bracket"}
                    </h2>
                    <div className="text-sm text-gray-400">
                      {profile?.full_name || profile?.email || "Unknown User"}
                    </div>
                  </div>

                  <Link
                    href={`/sports/march-madness-v2/bracket/view/${row.bracket_id}`}
                    className="px-3 py-2 rounded-md bg-green-500 text-black text-sm font-semibold hover:bg-green-400"
                  >
                    View Bracket
                  </Link>
                </div>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-700 p-3 rounded-lg">
                    <div className="text-gray-300 text-sm">Total Score</div>
                    <div className="text-2xl font-bold">{row.total_score}</div>
                  </div>

                  <div className="bg-slate-700 p-3 rounded-lg">
                    <div className="text-gray-300 text-sm">Correct Picks</div>
                    <div className="text-2xl font-bold">{row.correct_picks}</div>
                  </div>

                  <div className="bg-slate-700 p-3 rounded-lg">
                    <div className="text-gray-300 text-sm">Rounds</div>
                    <div className="text-sm">
                      {Object.entries(row.points_by_round ?? {}).map(
                        ([round, pts]) => (
                          <div key={round}>
                            Round {round}:{" "}
                            <span className="font-semibold">{pts}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-700 p-3 rounded-lg">
                    <div className="text-gray-300 text-sm">Bracket ID</div>
                    <div className="text-sm">{row.bracket_id}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}