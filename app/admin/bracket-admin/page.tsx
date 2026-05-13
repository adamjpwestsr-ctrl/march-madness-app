// app/admin/bracket-admin/page.tsx
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import BracketAdminClient from "./BracketAdminClient";

export default async function BracketAdminPage() {
  const supabase = await createSupabaseServerClient();

  const { data: games, error } = await supabase
    .from("games")
    .select("*")
    .order("round", { ascending: true })
    .order("game_id", { ascending: true });

  if (error) {
    console.error(error);
    return <div style={{ padding: 20 }}>Error loading games.</div>;
  }

  return (
    <BracketAdminClient games={games ?? []} />
  );
}
