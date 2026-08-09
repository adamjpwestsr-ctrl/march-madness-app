"use client";

import { useEffect, useState } from "react";
import SettingsSection from "@/app/components/SettingsSection";
import { updateUserProfile } from "./actions";
import { getFcmTokenForUser } from "@/utils/firebase";
import Link from "next/link";

type SettingsClientProps = {
  supabaseUser: any;
  profile: any;
};

export default function SettingsClient({ supabaseUser, profile }: SettingsClientProps) {
  const [loading, setLoading] = useState(false);
  const [localProfile, setLocalProfile] = useState(profile);

  // ⭐ FIX: mm_session stores userId, not id
  const userId = supabaseUser.userId;

  // ⭐ FIX: normalize badges so .map() never crashes
  const normalizedBadges = Array.isArray(localProfile.badges)
    ? localProfile.badges
    : (() => {
        try {
          return JSON.parse(localProfile.badges || "[]");
        } catch {
          return [];
        }
      })();

  useEffect(() => {
    if (localProfile?.push_notifications) {
      getFcmTokenForUser();
    }
  }, [localProfile?.push_notifications]);

  async function saveField(field: string, value: any) {
    setLoading(true);
    try {
      await updateUserProfile(userId, { [field]: value });

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

      {/* SOCIAL HUB HEADER */}
      <section>
        <h1 className="text-3xl font-semibold mb-2">Social Hub</h1>
        <p className="text-slate-400">
          Your home for community, conversation, and your BracketBoss identity.
        </p>

        <div className="flex flex-wrap gap-4 mt-4">
          <Link
            href="/social"
            className="px-4 py-2 bg-blue-600 rounded-lg text-sm hover:bg-blue-700"
          >
            Open Social Hub
          </Link>

          <Link
            href="/forum"
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm hover:bg-slate-700"
          >
            Forum
          </Link>

          <Link
            href="/leaderboards"
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm hover:bg-slate-700"
          >
            Leaderboard Hub
          </Link>

          <Link
            href="/challenges"
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm hover:bg-slate-700"
          >
            Challenge Hub
          </Link>
        </div>
      </section>

      {/* SOCIAL PREFERENCES */}
      <SettingsSection title="Social Preferences">
        <div className="space-y-6">

          {/* Preferred Forum Sport */}
          <div>
            <p className="font-medium mb-2">Preferred Forum Sport</p>
            <select
              value={localProfile.preferred_forum_sport ?? ""}
              onChange={(e) => saveField("preferred_forum_sport", e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Global Feed</option>
              <option value="NFL">NFL</option>
              <option value="NBA">NBA</option>
              <option value="MLB">MLB</option>
              <option value="NHL">NHL</option>
              <option value="Golf">Golf</option>
              <option value="NASCAR">NASCAR</option>
              <option value="F1">F1</option>
            </select>
          </div>

          {/* Show Activity Publicly */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Show My Activity Publicly</p>
              <p className="text-sm text-slate-400">
                Allow others to see your picks, wins, and forum posts.
              </p>
            </div>

            <button
              onClick={() => saveField("show_activity", !localProfile.show_activity)}
              className={`w-12 h-6 rounded-full transition ${
                localProfile.show_activity ? "bg-emerald-600" : "bg-slate-700"
              } relative`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition ${
                  localProfile.show_activity ? "translate-x-6" : ""
                }`}
              />
            </button>
          </div>

          {/* Show Badges Publicly */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Show My Badges Publicly</p>
              <p className="text-sm text-slate-400">
                Display badges on your profile and forum posts.
              </p>
            </div>

            <button
              onClick={() => saveField("show_badges", !localProfile.show_badges)}
              className={`w-12 h-6 rounded-full transition ${
                localProfile.show_badges ? "bg-emerald-600" : "bg-slate-700"
              } relative`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition ${
                  localProfile.show_badges ? "translate-x-6" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </SettingsSection>

      {/* PROFILE */}
      <SettingsSection title="Profile">
        <div className="space-y-4">

          {/* Display Name */}
          <div>
            <p className="text-sm text-slate-400">Display Name</p>
            <input
              value={localProfile.username}
              onChange={(e) => saveField("username", e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm w-full"
            />
          </div>

          {/* Email */}
          <div>
            <p className="text-sm text-slate-400">Email</p>
            <p className="text-lg font-medium">{supabaseUser.email}</p>
          </div>

          {/* Badges */}
          <div>
            <p className="text-sm text-slate-400 mb-2">Badges Earned</p>

            {normalizedBadges.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {normalizedBadges.map((badge: any) => (
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
            ) : (
              <p className="text-slate-500 text-sm">No badges earned yet.</p>
            )}
          </div>
        </div>
      </SettingsSection>

      {/* NOTIFICATIONS */}
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

          {/* Push Notifications */}
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

      {/* PREFERENCES */}
      <SettingsSection title="Preferences">
        <div className="space-y-6">

          {/* Favorite Sport */}
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

          {/* Theme */}
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
