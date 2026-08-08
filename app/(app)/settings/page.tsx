import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("mm_session");

  if (!sessionCookie) {
    return (
      <p className="text-slate-400">
        You need to be logged in to manage your settings.
      </p>
    );
  }

  let session: any;
  try {
    session = JSON.parse(sessionCookie.value);
  } catch {
    return (
      <p className="text-slate-400">
        Invalid session. Please log in again.
      </p>
    );
  }

  const supabase = await createSupabaseServerClient();

  const { data: profile, error } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", session.userId)
    .maybeSingle();

  if (error || !profile) {
    return (
      <p className="text-slate-400">
        Unable to load your profile. Please try again.
      </p>
    );
  }

  return <SettingsClient supabaseUser={session} profile={profile} />;
}
