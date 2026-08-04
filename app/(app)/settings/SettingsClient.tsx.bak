"use client";

import { useEffect, useState } from "react";
import SettingsSection from "@/app/components/SettingsSection";
import { updateUserProfile } from "./actions";
import { getFcmTokenForUser } from "@/utils/firebase";

type SettingsClientProps = {
  supabaseUser: any;
  profile: any;
};

export default function SettingsClient({ supabaseUser, profile }: SettingsClientProps) {
  const [loading, setLoading] = useState(false);

  // Local editable profile state
  const [localProfile, setLocalProfile] = useState(profile);

  // Auto-refresh FCM token when push notifications enabled
  useEffect(() => {
    if (localProfile?.push_notifications) {
      getFcmTokenForUser();
    }
  }, [localProfile?.push_notifications]);

  async function saveField(field: string, value: any) {
    setLoading(true);
    try {
      await updateUserProfile(supabaseUser.id, { [field]: value });

      setLocalProfile((prev: any) => ({
        ...prev,
        [field]: value,
      }));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-3xl font-semibold mb-2">Settings</h1>
        <p className="text-slate-400">
          Manage your profile, notifications, and preferences.
        </p>
      </section>

      <SettingsSection title="Profile">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-slate-400">Display Name</p>
            <input
              value={localProfile.username}
              onChange={(e) => saveField("username", e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm w-full"
            />
          </div>

          <div>
            <p className="text-sm text-slate-400">Email</p>
            <p className="text-lg font-medium">{supabaseUser.email}</p>
          </div>

          <div>
            <p className="text-sm text-slate-400 mb-2">Badges Earned</p>
            {localProfile.badges?.length === 0 ? (
              <p className="text-slate-500 text-sm">No badges earned yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {localProfile.badges.map((badge: any) => (
                  <div
                    key={badge.badge_name}
                    className={`flex flex-col items-center bg-slate-900 border border-slate-800 rounded-lg p-3 ${badge.color_class}`}
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
      </SettingsSection>

      <SettingsSection title="Notifications">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-slate-400">
                Get updates about challenges and trivia.
              </p>
            </div>

            <button
              onClick={() =>
                saveField("email_notifications", !localProfile.email_notifications)
              }
              className={`w-12 h-6 rounded-full transition ${
                localProfile.email_notifications ? "bg-emerald-600" : "bg-slate-700"
              } relative`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition ${
                  localProfile.email_notifications ? "translate-x-6" : ""
                }`}
              />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-slate-400">
                  Alerts for live events and leaderboard changes.
                </p>
              </div>

              <button
                onClick={() =>
                  saveField("push_notifications", !localProfile.push_notifications)
                }
                className={`w-12 h-6 rounded-full transition ${
                  localProfile.push_notifications ? "bg-emerald-600" : "bg-slate-700"
                } relative`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition ${
                    localProfile.push_notifications ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>

            {localProfile.push_notifications && (
              <div>
                <p className="text-sm text-slate-400">Phone Number</p>
                <input
                  type="tel"
                  placeholder="+12035551234"
                  value={localProfile.phone_number || ""}
                  onChange={(e) => saveField("phone_number", e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm w-full"
                />
              </div>
            )}
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Preferences">
        <div className="space-y-6">
          <div>
            <p className="font-medium mb-2">Favorite Sport</p>
            <select
              value={localProfile.favorite_sport}
              onChange={(e) => saveField("favorite_sport", e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm"
            >
              <option>NBA</option>
              <option>NFL</option>
              <option>MLB</option>
              <option>NHL</option>
            </select>
          </div>

          <div>
            <p className="font-medium mb-2">Theme</p>
            <div className="flex gap-3">
              <button
                onClick={() => saveField("theme", "dark")}
                className={`px-4 py-2 rounded-lg text-sm ${
                  localProfile.theme === "dark"
                    ? "bg-slate-800"
                    : "bg-slate-900 border border-slate-700"
                }`}
              >
                Dark
              </button>

              <button
                onClick={() => saveField("theme", "light")}
                className={`px-4 py-2 rounded-lg text-sm ${
                  localProfile.theme === "light"
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
