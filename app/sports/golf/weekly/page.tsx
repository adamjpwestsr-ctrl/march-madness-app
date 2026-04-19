import { createClient } from "@/utils/supabase/server";
import GolfWeeklyClient from "./GolfWeeklyClient";

interface Tournament {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  category: string | null;
  is_premium_event: boolean | null;
}

interface Player {
  id: number;
  name: string;
  country?: string | null;
  photo_url?: string | null;
}

export default async function GolfWeeklyPage() {
  const supabase = await createClient();

  const { data: tournaments } = await supabase
    .from("golf_tournaments")
    .select("id, name, start_date, end_date, category, is_premium_event")
    .order("start_date");

  const { data: players } = await supabase
    .from("golf_players")
    .select("id, name, country, photo_url")
    .order("name");

  return (
    <GolfWeeklyClient
      tournaments={(tournaments || []) as Tournament[]}
      players={(players || []) as Player[]}
    />
  );
}
