import { createClient } from "@/utils/supabase/server";
import AdminGolfWeeklyClient from "./AdminGolfWeeklyClient";

export default async function AdminGolfWeeklyPage() {
  const supabase = await createClient();

  if (!supabase) return;
    const { data: tournaments } = await supabase
    .from("golf_tournaments")
    .select("*")
    .order("start_date");

  if (!supabase) return;
    const { data: players } = await supabase
    .from("golf_players")
    .select("*")
    .order("name");

  return (
    <AdminGolfWeeklyClient
      tournaments={tournaments || []}
      players={players || []}
    />
  );
}
