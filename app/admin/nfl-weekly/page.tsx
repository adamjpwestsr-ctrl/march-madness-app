// /app/admin/nfl-weelly/page.tsx
import { supabaseServerClient as createClient } from "@/lib/supabaseServerClient";
import AdminWeeklyClient from "./AdminWeeklyClient";

export default async function AdminNFLWeeklyPage() {
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

  // Load ALL weekly settings
  const { data: settings, error: settingsError } = await supabase
    .from("nfl_weekly_settings")
    .select("*")
    .order("week_number");

  if (settingsError) {
    console.error("Settings error:", settingsError);
  }

  return (
    <AdminWeeklyClient
      teams={teams || []}
      settings={settings || []}
    />
  );
}

