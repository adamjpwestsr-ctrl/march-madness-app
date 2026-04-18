import { createSupabaseServerClient as createClient } from "@/lib/supabaseServerClient";
import AdminWeeklyClient from "./AdminWeeklyClient";

export default async function AdminNFLWeeklyPage() {
const supabase = await createClient();

  // Load teams server-side
  const { data: teams } = await supabase
    .from("nfl_teams")
    .select("*")
    .order("name");

  return <AdminWeeklyClient teams={teams || []} />;
}
