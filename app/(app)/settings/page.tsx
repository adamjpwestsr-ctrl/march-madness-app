"use client";

import { useEffect, useState } from "react";
import SettingsSection from "@/app/components/SettingsSection";
import {
  getUserProfile,
  updateUserProfile,
  initializeUsername,
  getUserBadges,
} from "./actions";

// 🔥 Firebase imports
import { messaging } from "@/utils/firebase";
import { getToken } from "firebase/messaging";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [favoriteSport, setFavoriteSport] = useState("NBA");
  const [theme, setTheme] = useState("dark");
  const [badges, setBadges] = useState<any[]>([]);

  // TODO: Replace with your actual auth user ID
  const currentUserId = 1;

  useEffect(() => {
    async function loadProfile() {
      const profile = await getUserProfile(currentUserId);
      const finalUsername =
        profile.username || (await initializeUsername(currentUserId));

      setUsername(finalUsername);
      setEmail(profile.email);
      setPhoneNumber(profile.phone_number ?? "");
      setEmailNotifications(profile.email_notifications);
      setPushNotifications(profile.push_notifications);
      setFavoriteSport(profile.favorite_sport);
      setTheme(profile.theme);

      const badgeList = await getUserBadges();
      setBadges(badgeList);

      setLoading(false);
    }

    loadProfile();
  }, []);

  async function saveField(field: string, value: any) {
    await updateUserProfile(currentUserId, { [field]: value });
  }

  // -----------------------------
  // E.164 VALIDATION
  // -----------------------------
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
      alert(
        "Phone numbers must be in international format.\nExample: +12035551234"
      );
      return;
    }

    await saveField("phone_number", normalized);
  }

  // -----------------------------
  // 🔥 Step 7 + Step 9: Push Permission + FCM Token
  // -----------------------------
 async function requestPushPermission() {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      alert("Push notifications are blocked. Enable them in your browser settings.");
      return;
    }

    // Messaging may be null on unsupported browsers
    if (!messaging) {
      console.warn("Firebase messaging is not supported in this browser.");
      return;
    }

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });

    if (!token) {
      alert("Unable to get device token.");
      return;
    }

    await saveField("fcm_token", token);
    console.log("FCM token saved:", token);
  } catch (err) {
    console.error("Error getting FCM token:", err);
  }
}


  // Trigger token retrieval when user enables push notifications
  useEffect(() => {
    if (pushNotifications) {
      requestPushPermission();
    }
  }, [pushNotifications]);

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

          {/* Badges */}
          <div>
            <p className="text-sm text-slate-400 mb-2">Badges Earned</p>
            {badges.length === 0 ? (
              <p className="text-slate-500 text-sm">No badges earned yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {badges.map((badge) => (
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
          <div className="flex flex-col gap-3">
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

            {/* Phone Number */}
            {pushNotifications && (
              <div>
                <p className="text-sm text-slate-400">Phone Number</p>
                <input
                  type="tel"
                  placeholder="+12035551234"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  onBlur={handlePhoneBlur}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm w-full"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Enter your number in international format (E.164).  
                  Example: +1 for U.S., +44 for U.K.
                </p>
              </div>
            )}
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
