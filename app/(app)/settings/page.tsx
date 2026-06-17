import SettingsSection from "@/app/components/SettingsSection";
import {
  getUserProfile,
  updateUserProfile,
  initializeUsername,
  getUserBadges,
} from "./actions";
import { getCurrentUserSession } from "@/lib/getCurrentUserSession";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
 const session = await getCurrentUserSession();

  if (!session) {
    // Not logged in; you can redirect to /login if you prefer
    return (
      <p className="text-slate-400">
        You need to be logged in to manage your settings.
      </p>
    );
  }

  const userId = session.userId;

  const profile = await getUserProfile(userId);
  const finalUsername =
  profile.username || (await initializeUsername(userId));

 const badges = await getUserBadges();

  return (
    <SettingsClient
      userId={userId}
      initialUsername={finalUsername}
      initialEmail={profile.email}
      initialPhoneNumber={profile.phone_number ?? ""}
      initialEmailNotifications={profile.email_notifications}
      initialPushNotifications={profile.push_notifications}
      initialFavoriteSport={profile.favorite_sport}
      initialTheme={profile.theme}
      initialBadges={badges}
    />
  );
}
