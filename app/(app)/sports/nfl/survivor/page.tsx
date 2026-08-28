import SurvivorClient from "./SurvivorClient";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function SurvivorPage() {
  const supabase = await createSupabaseServerClient();

  // Use relative API path to avoid Invalid URL errors
  const res = await fetch("/api/nfl/survivor/state", {
    cache: "no-store",
  });

  const data = await res.json();

  if (!data || !data.week) {
    return (
      <div className="text-white p-6">
        <h1 className="text-xl font-semibold">NFL Survivor</h1>
        <p className="text-red-400 mt-2">Failed to load Survivor state.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white p-6">
      <SurvivorClient
        week={data.week}
        matchups={data.matchups}
        teamsById={data.teams}
        lockTime={data.lockTime}
      />
    </div>
  );
}
