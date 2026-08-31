import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function NcaafLeaderboardPage() {
  const supabase = await createSupabaseServerClient();

  const seasonYear = new Date().getFullYear();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/ncaaf/leaderboard?seasonYear=${seasonYear}`,
    { cache: "no-store" }
  );

  const rows = await res.json();

  return (
    <div className="min-h-screen text-white p-6 space-y-8">
      <header>
        <h1 className="text-4xl font-bold">NCAAF Leaderboard</h1>
        <p className="text-slate-400">Season {seasonYear}</p>
      </header>

      <LeaderboardTable rows={rows} />
    </div>
  );
}
