import SettingsClient from "./SettingsClient";
import { supabaseServerClient } from "@/lib/supabaseServerClient";
import {
  getUserBadges,
  initializeUsername,
} from "./actions";

export default async function SettingsPage() {
  const supabase = supabaseServerClient();

  // Get current authenticated user
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

  // Fetch profile using auth_id
  const { data: profile, error } = await supabase
    .from("users")
    .select(
      "user_id, auth_id, username, email, phone_number, email_notifications, push_notifications, favorite_sport, theme"
    )
    .eq("auth_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Settings page error:", error);
    throw new Error("Failed to load settings");
  }

  // Initialize username if missing
  const finalUsername =
    profile?.username || (await initializeUsername(profile?.auth_id));

  // Fetch badges
  const badges = await getUserBadges();

  return (
    <SettingsClient
      userId={profile?.auth_id}          // ⭐ now passing auth_id
      initialUsername={finalUsername}
      initialEmail={profile?.email}
      initialPhoneNumber={profile?.phone_number ?? ""}
      initialEmailNotifications={profile?.email_notifications}
      initialPushNotifications={profile?.push_notifications}
      initialFavoriteSport={profile?.favorite_sport}
      initialTheme={profile?.theme}
      initialBadges={badges}
    />
  );
}

