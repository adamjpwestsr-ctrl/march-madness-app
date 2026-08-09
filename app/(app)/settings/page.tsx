import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("mm_session");

    if (!sessionCookie) {
      return (
        <div className="p-10 text-red-400">
          <h1 className="text-2xl font-bold mb-4">Not Logged In</h1>
          <p>You need to be logged in to manage your settings.</p>
        </div>
      );
    }

    let session: any;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      return (
        <div className="p-10 text-red-400">
          <h1 className="text-2xl font-bold mb-4">Invalid Session</h1>
          <p>Your session cookie is corrupted. Please log in again.</p>
        </div>
      );
    }

    const supabase = await createSupabaseServerClient();

    const { data: profile, error } = await supabase
      .from("users")
      .select("*")
      .eq("user_id", session.userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    if (!profile) {
      return (
        <div className="p-10 text-red-400">
          <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
          <p>Your account could not be loaded. Please try again.</p>
        </div>
      );
    }

    return (
      <div className="p-10 text-white">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <SettingsClient supabaseUser={session} profile={profile} />
      </div>
    );
  } catch (err: any) {
    return (
      <div className="p-10 text-red-400">
        <h1 className="text-2xl font-bold mb-4">Settings Error</h1>
        <p>{err.message}</p>
      </div>
    );
  }
}
