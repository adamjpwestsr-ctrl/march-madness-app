"use client";

import { useState } from "react";
import SettingsSection from "@/app/components/SettingsSection";

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [favoriteSport, setFavoriteSport] = useState("NBA");

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
          <div>
            <p className="text-sm text-slate-400">Display Name</p>
            <p className="text-lg font-medium">Adam</p>
          </div>

          <div>
            <p className="text-sm text-slate-400">Email</p>
            <p className="text-lg font-medium">adam@example.com</p>
          </div>

          <button className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition text-sm">
            Edit Profile
          </button>
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
              onClick={() => setEmailNotifications(!emailNotifications)}
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
              onClick={() => setPushNotifications(!pushNotifications)}
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
              onChange={(e) => setFavoriteSport(e.target.value)}
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
              <button className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition text-sm">
                Dark
              </button>
              <button className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm">
                Light
              </button>
            </div>
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}
