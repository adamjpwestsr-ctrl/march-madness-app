import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("mm_session");

  if (!sessionCookie) redirect("/login");

  let session: any;
  try {
    session = JSON.parse(sessionCookie.value);
  } catch {
    redirect("/login");
  }

  const supabase = await createSupabaseServerClient();

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", session.userId)
    .maybeSingle();

  if (!profile) redirect("/login");

  return (
    <div className="p-10 text-white">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <SettingsClient supabaseUser={session} profile={profile} />
    </div>
  );
}
