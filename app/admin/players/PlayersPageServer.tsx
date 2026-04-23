// app/admin/players/PlayersPageServer.tsx
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import PlayersPageClient from "./PlayersPageClient";

export default async function PlayersPageServer() {
  const supabase = await createSupabaseServerClient();

  // 1) Fetch active contests
  const { data: contests } = await supabase
    .from("contests")
    .select("id, name, sport")
    .eq("is_active", true)
    .order("name", { ascending: true });

  // 2) Fetch all users
  const { data: users } = await supabase
    .from("users")
    .select("user_id, email")
    .order("email", { ascending: true });

  // 3) Fetch participation rows
  const { data: statuses } = await supabase
    .from("user_challenge_status")
    .select(`
      id,
      user_id,
      contest_id,
      is_active,
      has_paid,
      paid_at,
      users:user_id ( email ),
      contests:contest_id ( name, sport )
    `)
    .order("id", { ascending: true });

  // 4) Normalize for client
  const normalized = (statuses || []).map((row) => ({
    id: row.id,
    user_id: row.user_id,
    contest_id: row.contest_id,
    is_active: row.is_active,
    has_paid: row.has_paid,
    paid_at: row.paid_at,
    email: row.users?.[0]?.email || "",
    contest_name: row.contests?.[0]?.name || "",
    sport: row.contests?.[0]?.sport || "",
  }));

  return (
    <PlayersPageClient
      initialData={{
        users: users || [],
        contests: contests || [],
        statuses: normalized,
      }}
    />
  );
}
