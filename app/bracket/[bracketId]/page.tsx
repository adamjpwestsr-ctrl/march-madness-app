export const dynamic = "force-dynamic";

// app/bracket/[bracketId]/page.tsx
import { notFound } from "next/navigation";
import { supabaseServerClient } from "@/lib/supabaseServerClient";
import { buildBracketView, BracketView } from "../buildBracketView";
import BracketViewerClient from "../BracketViewerClient";

type PageProps = {
  params: { bracketId: string };
};

export default async function BracketPage({ params }: PageProps) {
  const supabase = supabaseServerClient();
  const bracketId = params.bracketId;

  // Load bracket
  const { data: bracket, error: bracketErr } = await supabase
    .from("brackets")
    .select("*")
    .eq("bracket_id", bracketId)
    .single();

  if (bracketErr || !bracket) {
    return notFound();
  }

  // Load user
  const { data: user, error: userErr } = await supabase
    .from("users")
    .select("user_id, username, email")
    .eq("user_id", bracket.user_id)
    .single();

  if (userErr || !user) {
    return notFound();
  }

  // Load games
  const { data: games, error: gamesErr } = await supabase
    .from("games")
    .select("*");

  if (gamesErr || !games) {
    throw new Error("Failed to load games.");
  }

  // Load picks for this bracket
  const { data: picks, error: picksErr } = await supabase
    .from("picks")
    .select("*")
    .eq("bracket_id", bracketId);

  if (picksErr || !picks) {
    throw new Error("Failed to load picks.");
  }

  const view: BracketView = buildBracketView({
    bracket,
    user,
    games,
    picks,
  });

  return <BracketViewerClient view={view} />;
}
