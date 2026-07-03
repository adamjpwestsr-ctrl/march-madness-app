import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NascarImportPanel from "./NascarImportPanel";
import NascarSchedulePanel from "./NascarSchedulePanel";

export default async function NascarAdminPage() {
  const supabase = createClient();
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

  const { data: races } = await supabase
    .from("nascar_races")
    .select("*")
    .order("date", { ascending: true });

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">
      <h1 className="text-2xl font-semibold text-white">🏁 NASCAR Admin</h1>

      <NascarImportPanel races={races || []} />
      <NascarSchedulePanel />
    </div>
  );
}
