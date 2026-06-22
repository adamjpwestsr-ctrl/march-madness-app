import { createClient } from "@/utils/supabase/server";
import GolfWeeklyClient from "./GolfWeeklyClient";

interface Tournament {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  category: string | null;
  is_premium_event: boolean | null;
  is_current: boolean | null; // ⭐ added
}

interface Player {
  id: number;
  name: string;
  country?: string | null;
  photo_url?: string | null;
}

export default async function GolfWeeklyPage() {
  try {
    const supabase = await createClient();
    if (!supabase) {
      console.error("Supabase client failed to initialize");
      return (
        <div className="p-10 text-red-400">
          Server error: Supabase client not initialized
        </div>
      );
    }

    // Fetch tournaments
    const {
      data: tournaments,
      error: tErr,
    } = await supabase
      .from("golf_tournaments")
      .select(
        "id, name, start_date, end_date, category, is_premium_event, is_current" // ⭐ added is_current
      )
      .order("start_date");

    if (tErr) {
      console.error("Tournament fetch error:", tErr);
      return (
        <div className="p-10 text-red-400">
          Server error loading tournaments: {tErr.message}
        </div>
      );
    }

    // Fetch players
    const {
      data: players,
      error: pErr,
    } = await supabase
      .from("golf_players")
      .select("id, name, country, photo_url")
      .order("name");

    if (pErr) {
      console.error("Player fetch error:", pErr);
      return (
        <div className="p-10 text-red-400">
          Server error loading players: {pErr.message}
        </div>
      );
    }

    // Defensive defaults
    const safeTournaments = Array.isArray(tournaments)
      ? tournaments
      : [];
    const safePlayers = Array.isArray(players) ? players : [];

    return (
      <GolfWeeklyClient
        tournaments={safeTournaments}
        players={safePlayers}
      />
    );
  } catch (err: any) {
    console.error("GolfWeeklyPage fatal error:", err);
    return (
      <div className="p-10 text-red-400">
        Server crashed: {String(err?.message || err)}
      </div>
    );
  }
}