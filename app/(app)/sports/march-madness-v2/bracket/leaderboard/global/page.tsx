import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import GlobalLeaderboard from "../../../leaderboard/GlobalLeaderboard";

export default async function GlobalLeaderboardRoute() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <GlobalLeaderboard />;
}