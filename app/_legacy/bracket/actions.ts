"use server";

import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side Supabase client (service role)
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ⭐ CREATE BRACKET — uses email, but still fills user_id for legacy schema
export async function createBracket(formData: FormData) {
  const email = formData.get("email")?.toString().toLowerCase();
  if (!email) throw new Error("Missing email");

  // Look up user_id from users table to satisfy existing brackets schema
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("user_id")
    .eq("email", email)
    .maybeSingle();

  if (userError) {
    console.error("Lookup user_id error:", userError);
    throw new Error("Failed to resolve user for bracket");
  }

  if (!user || user.user_id == null) {
    console.error("No user_id found for email:", email);
    throw new Error("User not found for bracket creation");
  }

  // ⭐ 1. Create the bracket
  const { data: newBracket, error: bracketError } = await supabase
    .from("brackets")
    .insert({
      user_id: user.user_id,
      email,
      bracket_name: "My Bracket",
      icon: "🏀",
    })
    .select()
    .single();

  if (bracketError) {
    console.error("Create bracket error:", bracketError);
    throw new Error("Failed to create bracket");
  }

  const bracketId = newBracket.bracket_id;

  // ⭐ 2. Load Round of 64 games to generate initial bracket_rounds
  const { data: games, error: gameError } = await supabase
    .from("games")
    .select("*")
    .eq("round", 1)
    .order("game_id", { ascending: true });

  if (gameError) {
    console.error("Load games error:", gameError);
    throw new Error("Failed to load initial games");
  }

  // ⭐ 3. Insert bracket_rounds for Round of 64
  const initialRounds = games.map((g) => ({
    bracket_id: bracketId,
    round: g.round,
    game_id: g.game_id,
    region: g.region,
    team1: g.team1,
    team2: g.team2,
    seed1: g.seed1,
    seed2: g.seed2,
    winner: null,
  }));

  const { error: insertRoundsError } = await supabase
    .from("bracket_rounds")
    .insert(initialRounds);

  if (insertRoundsError) {
    console.error("Insert initial rounds error:", insertRoundsError);
    throw new Error("Failed to initialize bracket rounds");
  }

  // ⭐ 4. Load ALL rounds for cleanup (Rounds > 1)
  const { data: allRounds, error: loadRoundsError } = await supabase
    .from("bracket_rounds")
    .select("*")
    .eq("bracket_id", bracketId);

  if (loadRoundsError) {
    console.error("Error loading rounds for cleanup:", loadRoundsError);
    throw new Error("Failed to load rounds for cleanup");
  }

  // ⭐ 5. Clean rounds: only Round 1 should have teams
  const cleanedRounds = allRounds.map((r) => {
    if (r.round > 1) {
      return {
        ...r,
        team1: null,
        team2: null,
        seed1: null,
        seed2: null,
        winner: null,
      };
    }
    return r;
  });

  // ⭐ 6. Write cleaned rounds back to DB
  const { error: updateError } = await supabase
    .from("bracket_rounds")
    .upsert(cleanedRounds);

  if (updateError) {
    console.error("Error cleaning bracket rounds:", updateError);
    throw new Error("Failed to clean bracket rounds");
  }

  // ⭐ 7. Redirect to the new bracket
  redirect(`/bracket?bid=${bracketId}`);
}

// ⭐ DELETE BRACKET
export async function deleteBracket(formData: FormData) {
  const bracketId = formData.get("bracketId");
  if (!bracketId) return;

  await supabase.from("brackets").delete().eq("bracket_id", bracketId);
}

// ⭐ RENAME BRACKET — checks email via session for safety
export async function renameBracket(formData: FormData) {
  const bracketId = formData.get("bracketId");
  const newName = formData.get("newName");

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("mm_session");
  if (!sessionCookie) throw new Error("Not logged in");

  const session = JSON.parse(sessionCookie.value);
  const email = session.email?.toLowerCase();
  if (!email) throw new Error("Missing email in session");

  await supabase
    .from("brackets")
    .update({ bracket_name: newName })
    .eq("bracket_id", bracketId)
    .eq("email", email);
}

// ⭐ UPDATE BRACKET ICON — checks email via session for safety
export async function updateBracketIcon(formData: FormData) {
  const bracketId = formData.get("bracketId");
  const icon = formData.get("icon");

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("mm_session");
  if (!sessionCookie) throw new Error("Not logged in");

  const session = JSON.parse(sessionCookie.value);
  const email = session.email?.toLowerCase();
  if (!email) throw new Error("Missing email in session");

  await supabase
    .from("brackets")
    .update({ icon })
    .eq("bracket_id", bracketId)
    .eq("email", email);
}

// ⭐ SUBMIT BRACKET — DIRECT ARGUMENT VERSION (FINAL)
export async function submitBracket(bracketId: string, tiebreaker: number) {
  if (!bracketId) throw new Error("Missing bracketId");

  const { data, error } = await supabase
    .from("bracket_submissions")
    .upsert({
      bracket_id: bracketId,
      tiebreaker,
      submitted_at: new Date().toISOString(),
      mulligans_used: 0,
    })
    .select()
    .single();

  if (error) {
    console.error("🔥 SUBMIT BRACKET ERROR:", error);
    return { success: false, error };
  }

  return { success: true };
}
