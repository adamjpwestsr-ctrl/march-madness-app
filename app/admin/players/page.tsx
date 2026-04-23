import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import PlayersPageServer from "./PlayersPageServer";

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

  // ⭐ NEW: Server wrapper handles all data fetching
  return <PlayersPageServer />;
}
