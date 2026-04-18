import { createClient } from "@/utils/supabase/server";
import PlayoffClient from "./PlayoffClient";

export default async function NFLPlayoffPage() {
  const supabase = createClient();

  // Load teams server-side
  const { data: teams } = await supabase
    .from("nfl_teams")
    .select("*")
    .order("name");

  return <PlayoffClient teams={teams || []} />;
}
