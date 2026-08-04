// app/(app)/settings/page.tsx
import SettingsClient from "./SettingsClient";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export default async function SettingsPage() {
  // Use unified Supabase Auth session
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <p className="text-slate-400">
        You need to be logged in to manage your settings.
      </p>
    );
  }

  // Load full profile from your users table
  const { data: profile, error } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !profile) {
    return (
      <p className="text-slate-400">
        Unable to load your profile. Please try again.
      </p>
    );
  }

  // Pass unified-auth data to client
  return (
    <SettingsClient
      supabaseUser={user}
      profile={profile}
    />
  );
}
