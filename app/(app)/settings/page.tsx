"use client";

import { useEffect, useState } from "react";
import SettingsSection from "@/app/components/SettingsSection";
import {
  getUserProfile,
  updateUserProfile,
  initializeUsername,
} from "./actions";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [favoriteSport, setFavoriteSport] = useState("NBA");
  const [theme, setTheme] = useState("dark");

  // TODO: Replace with your actual auth user ID
  const currentUserId = 1;

  // Load profile on mount
  useEffect(() => {
    async function loadProfile() {
      const profile = await getUserProfile(currentUserId);

      // Auto-generate username if missing
      const finalUsername =
        profile.username || (await initializeUsername(currentUserId));

      setUsername(finalUsername);
      setEmail(profile.email);

      setEmailNotifications(profile.email_notifications);
      setPushNotifications(profile.push_notifications);
      setFavoriteSport(profile.favorite_sport);
      setTheme(profile.theme);

      setLoading(false);
    }

    loadProfile();
  }, []);

  // Save helper
  async function saveField(field: string, value: any) {
    await updateUserProfile(currentUserId, { [field]: value });
  }

  if (loading) {
    return <p className="text-slate-400">Loading settings...</p>;
  }

  return (
    <div className="space-y-10">
      {/* Page Title */}
      <section>
        <h1 className="text-3xl font-semibold mb-2">Settings</h1>
        <p className="text-slate-400">
          Manage your profile, notifications, and preferences.
        </p>
      </section>

      {/* Profile Section */}
      <SettingsSection title="Profile">
        <div className="space-y-4">
          {/* Username */}
          <div>
            <p className="text-sm text-slate-400">Display Name</p>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onBlur={() => saveField("username", username)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm w-full"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <p className="text-sm text-slate-400">Email</p>
            <p className="text-lg font-medium">{email}</p>
          </div>
        </div>
      </SettingsSection>

      {/* Notification Settings */}
      <SettingsSection title="Notifications">
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
              className={`w-12 h-6 rounded-full transition ${
                emailNotifications ? "bg-emerald-600" : "bg-slate-700"
              } relative`}
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
              className={`w-12 h-6 rounded-full transition ${
                pushNotifications ? "bg-emerald-600" : "bg-slate-700"
              } relative`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition ${
                  pushNotifications ? "translate-x-6" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </SettingsSection>

      {/* Preferences */}
      <SettingsSection title="Preferences">
        <div className="space-y-6">
          {/* Favorite Sport */}
          <div>
            <p className="font-medium mb-2">Favorite Sport</p>
            <select
              value={favoriteSport}
              onChange={(e) => {
                setFavoriteSport(e.target.value);
                saveField("favorite_sport", e.target.value);
              }}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm"
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
                className={`px-4 py-2 rounded-lg text-sm ${
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
                className={`px-4 py-2 rounded-lg text-sm ${
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
      </SettingsSection>
    </div>
  );
}
