import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import F1ImportPanel from "./F1ImportPanel";
import F1SchedulePanel from "./F1SchedulePanel";

export default async async function F1AdminPage() {
  const supabase = await createSupabaseServerClient();
  const session = await supabase.auth.getUser();
  const userId = session.data.user?.id;

  // Admin-only guard
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("user_id", userId)
    .single();

  if (profile?.role !== "admin") {
    redirect("/");
  }

  // Fetch all F1 races
  const { data: races } = await supabase
    .from("f1_races")
    .select("*")
    .order("date", { ascending: true });

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">
      <h1 className="text-2xl font-semibold text-white">🏎️ F1 Admin</h1>

      <F1ImportPanel races={races || []} />
      <F1SchedulePanel />
    </div>
  );
}
