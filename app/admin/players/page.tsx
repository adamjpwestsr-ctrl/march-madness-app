import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import PlayersPageClient from "./PlayersPageClient";

export const fetchCache = "force-no-store";
export const revalidate = 0;
export const dynamic = "force-dynamic";
export const runtime = "edge";

export default async function PlayersPage() {
  const supabase = await createSupabaseServerClient();

  // 1) Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const email = user.email?.toLowerCase();
  if (!email) redirect("/login");

  // 2) Admin check
  const { data: dbUser } = await supabase
    .from("users")
    .select("is_admin")
    .eq("email", email)
    .maybeSingle();

  if (!dbUser?.is_admin) redirect("/bracket");

  // 3) Active contests
  const { data: contests } = await supabase
    .from("contests")
    .select("id, name, sport")
    .eq("is_active", true)
    .order("name", { ascending: true });

  // 4) All users
  const { data: users } = await supabase
    .from("users")
    .select("user_id, email")
    .order("email", { ascending: true });

  // 5) Participation rows
  const { data: statuses } = await supabase
    .from("user_challenge_status")
    .select(
      `
      id,
      user_id,
      contest_id,
      is_active,
      has_paid,
      paid_at,
      users:user_id ( email ),
      contests:contest_id ( name, sport )
    `
    )
    .order("id", { ascending: true });

  // 6) Normalize for client
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
