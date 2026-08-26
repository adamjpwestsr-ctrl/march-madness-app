// /app/admin/nfl-survivor/page.tsx
import { createSupabaseServerClient as createClient } from "@/lib/supabaseServerClient";
import AdminSurvivorClient from "./AdminSurvivorClient";

export default async function AdminNFLSurvivorPage() {
  const supabase = await createClient();

  if (!supabase) {
    return <div className="text-red-500 p-6">Supabase client failed to load.</div>;
  }

  // Load teams
  const { data: teams, error: teamsError } = await supabase
    .from("nfl_teams")
    .select("*")
    .order("name");

  if (teamsError) {
    console.error("Teams error:", teamsError);
  }

  // Load Survivor weekly settings
  const { data: settings, error: settingsError } = await supabase
    .from("survivor_weekly_settings")
    .select("*")
    .order("week_number");

  if (settingsError) {
    console.error("Settings error:", settingsError);
  }

  return (
    <AdminSurvivorClient
      teams={teams || []}
      settings={settings || []}
    />
  );
}
