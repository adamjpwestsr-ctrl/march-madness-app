"use client";

import { useEffect, useState } from "react";
import { updateUserProfile } from "./actions";
import { messaging } from "@/utils/firebase";
import { getToken } from "firebase/messaging";
import { toast } from "react-hot-toast";
import {
  UserIcon,
  BellIcon,
  Cog6ToothIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

type SettingsClientProps = {
  userId: string;
  initialUsername: string;
  initialEmail: string;
  initialPhoneNumber: string;
  initialEmailNotifications: boolean;
  initialPushNotifications: boolean;
  initialFavoriteSport: string;
  initialTheme: string;
  initialBadges: any[];
};

export default function SettingsClient({
  userId,
  initialUsername,
  initialEmail,
  initialPhoneNumber,
  initialEmailNotifications,
  initialPushNotifications,
  initialFavoriteSport,
  initialTheme,
  initialBadges,
}: SettingsClientProps) {
  const [loading, setLoading] = useState(false);

  const [username, setUsername] = useState(initialUsername);
  const [email] = useState(initialEmail);
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);

  const [emailNotifications, setEmailNotifications] = useState(
    initialEmailNotifications
  );
  const [pushNotifications, setPushNotifications] = useState(
    initialPushNotifications
  );
  const [favoriteSport, setFavoriteSport] = useState(initialFavoriteSport);
  const [theme, setTheme] = useState(initialTheme);
  const [badges, setBadges] = useState<any[]>(initialBadges);

  async function saveField(field: string, value: any) {
    setLoading(true);
    try {
      await updateUserProfile(userId, { [field]: value });
      toast.success("Settings saved", { icon: "💾" });
    } finally {
      setLoading(false);
    }
  }

  function normalizePhone(num: string): string {
    return num.trim();
  }

  function isValidE164(num: string): boolean {
    return /^\+[1-9]\d{1,14}$/.test(num);
  }

  async function handlePhoneBlur() {
    const normalized = normalizePhone(phoneNumber);

    if (!normalized) return;

    if (!isValidE164(normalized)) {
      toast.error("Phone must be in +123 format");
      return;
    }

    await saveField("phone_number", normalized);
  }

  async function requestPushPermission() {
    try {
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        toast.error("Enable notifications in browser settings");
        return;
      }

      if (!messaging) return;

      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });

      if (!token) {
        toast.error("Unable to get device token");
        return;
      }

      await saveField("fcm_token", token);
    } catch (err) {
      console.error("Error getting FCM token:", err);
    }
  }

  useEffect(() => {
    if (pushNotifications) {
      requestPushPermission();
    }
  }, [pushNotifications]);

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <section>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-slate-400 mt-1">
          Manage your profile, notifications, and preferences.
        </p>
      </section>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Profile */}
        <div className="backdrop-blur-md bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-lg">
          <h2 className="flex items-center gap-2 text-xl font-bold mb-4">
            <UserIcon className="w-5 h-5 text-emerald-400" />
            Profile
          </h2>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-400">Display Name</p>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={() => saveField("username", username)}
                className="bg-slate-900/70 border border-slate-700 rounded-lg px-3 py-2 text-sm w-full"
              />
            </div>

            <div>
              <p className="text-sm text-slate-400">Email</p>
              <p className="text-lg font-medium">{email}</p>
            </div>

            <div>
              <p className="text-sm text-slate-400 mb-2">Badges Earned</p>
              {badges.length === 0 ? (
                <p className="text-slate-500 text-sm">No badges earned yet.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {badges.map((badge) => (
                    <div
                      key={badge.badge_name}
                      className={`flex flex-col items-center bg-slate-900/70 border border-slate-700 rounded-lg p-3 hover:scale-105 transition ${badge.color_class}`}
                    >
                      <span className="text-2xl mb-1">{badge.badge_icon}</span>
                      <p className="text-sm font-medium">{badge.badge_name}</p>
                      <p className="text-xs text-slate-500">
                        {badge.rule_type === "total_points"
                          ? `${badge.threshold} pts`
                          : `${badge.threshold} contests`}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="backdrop-blur-md bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-lg">
          <h2 className="flex items-center gap-2 text-xl font-bold mb-4">
            <BellIcon className="w-5 h-5 text-blue-400" />
            Notifications
          </h2>

          <div className="space-y-6">
            {/* Email Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-slate-400">
                  Get updates about challenges and trivia.
                </p>
              </div>

              <button
                onClick={() => {
                  const newVal = !emailNotifications;
                  setEmailNotifications(newVal);
                  saveField("email_notifications", newVal);
                }}
                className={`w-12 h-6 rounded-full transition relative ${
                  emailNotifications ? "bg-emerald-600" : "bg-slate-700"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition ${
                    emailNotifications ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>

            {/* Push Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-slate-400">
                  Alerts for live events and leaderboard changes.
                </p>
              </div>

              <button
                onClick={() => {
                  const newVal = !pushNotifications;
                  setPushNotifications(newVal);
                  saveField("push_notifications", newVal);
                }}
                className={`w-12 h-6 rounded-full transition relative ${
                  pushNotifications ? "bg-emerald-600" : "bg-slate-700"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition ${
                    pushNotifications ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>

            {pushNotifications && (
              <div>
                <p className="text-sm text-slate-400">Phone Number</p>
                <input
                  type="tel"
                  placeholder="+12035551234"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  onBlur={handlePhoneBlur}
                  className="bg-slate-900/70 border border-slate-700 rounded-lg px-3 py-2 text-sm w-full"
                />
              </div>
            )}
          </div>
        </div>

        {/* Preferences */}
        <div className="backdrop-blur-md bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-lg lg:col-span-2">
          <h2 className="flex items-center gap-2 text-xl font-bold mb-4">
            <Cog6ToothIcon className="w-5 h-5 text-purple-400" />
            Preferences
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Favorite Sport */}
            <div>
              <p className="font-medium mb-2">Favorite Sport</p>
              <select
                value={favoriteSport}
                onChange={(e) => {
                  setFavoriteSport(e.target.value);
                  saveField("favorite_sport", e.target.value);
                }}
                className="bg-slate-900/70 border border-slate-700 rounded-lg px-3 py-2 text-sm w-full"
              >
                <option>NBA</option>
                <option>NFL</option>
                <option>MLB</option>
                <option>NHL</option>
              </select>
            </div>

            {/* Theme */}
            <div>
              <p className="font-medium mb-2">Theme</p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setTheme("dark");
                    saveField("theme", "dark");
                  }}
                  className={`px-4 py-2 rounded-lg text-sm transition ${
                    theme === "dark"
                      ? "bg-slate-800"
                      : "bg-slate-900 border border-slate-700"
                  }`}
                >
                  Dark
                </button>

                <button
                  onClick={() => {
                    setTheme("light");
                    saveField("theme", "light");
                  }}
                  className={`px-4 py-2 rounded-lg text-sm transition ${
                    theme === "light"
                      ? "bg-slate-800"
                      : "bg-slate-900 border border-slate-700"
                  }`}
                >
                  Light
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
