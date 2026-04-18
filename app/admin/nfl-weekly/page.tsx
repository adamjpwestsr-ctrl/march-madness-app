import { createSupabaseServerClient as createClient } from "@/lib/supabaseServerClient";
import AdminWeeklyClient from "./AdminWeeklyClient";

export default async function AdminNFLWeeklyPage() {
  const supabase = await createClient();

  // Load teams server-side
  const { data: teams } = await supabase
    .from("nfl_teams")
    .select("*")
    .order("name");

  // Load weekly settings (lock time, etc.)
  const { data: settings } = await supabase
    .from("nfl_weekly_settings")
    .select("*")
    .single();

  return (
    <AdminWeeklyClient
      teams={teams || []}
      settings={settings || {}}
    />
  );
}
