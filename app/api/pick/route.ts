import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: Request) {
  try {
    const { bracketId, gameId, teamId } = await req.json();

    if (!bracketId || !gameId || !teamId) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // 1. UPSERT THE PICK
    const { error: upsertError } = await supabase
      .from("picks")
      .upsert(
        {
          bracket_id: bracketId,
          game_id: gameId,
          team_id: teamId,
        },
        { onConflict: "bracket_id,game_id" }
      );

    if (upsertError) {
      console.error("Pick upsert error:", upsertError);
      return NextResponse.json(
        { error: "Failed to save pick." },
        { status: 500 }
      );
    }

    // 2. GET DOWNSTREAM GAMES (RPC)
    const { data: downstream, error: downstreamError } = await supabase.rpc(
      "get_downstream_games",
      { input_game_id: gameId }
    );

    if (downstreamError) {
      console.error("Downstream RPC error:", downstreamError);
      return NextResponse.json(
        { error: "Failed to update downstream games." },
        { status: 500 }
      );
    }

    // 3. UPDATE DOWNSTREAM PICKS
    if (Array.isArray(downstream)) {
      for (const g of downstream) {
        await supabase
          .from("picks")
          .upsert(
            {
              bracket_id: bracketId,
              game_id: g.game_id,
              team_id: g.winner_team_id,
            },
            { onConflict: "bracket_id,game_id" }
          );
      }
    }

    // 4. RETURN UPDATED PICKS
    const { data: updatedPicks } = await supabase
      .from("picks")
      .select("*")
      .eq("bracket_id", bracketId);

    return NextResponse.json({
      success: true,
      picks: updatedPicks || [],
    });
  } catch (err) {
    console.error("Pick API error:", err);
    return NextResponse.json(
      { error: "Server error saving pick." },
      { status: 500 }
    );
  }
}
