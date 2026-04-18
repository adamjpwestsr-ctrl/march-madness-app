import { createClient } from "@/utils/supabase/server";
import PlayoffClient from "./PlayoffClient";

export default async function PlayoffPage() {
  // ⭐ MUST await the Supabase client
  const supabase = await createClient();

  // Load teams server-side
  const { data: teams } = await supabase
    .from("nfl_teams")
    .select("*")
    .order("name");

  return <PlayoffClient teams={teams || []} />;
}
