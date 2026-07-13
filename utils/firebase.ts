// utils/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export async function getFcmTokenForUser() {
  const supported = await isSupported();
  if (!supported) return null;

  const messaging = getMessaging(app);
  const supabase = createSupabaseBrowserClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  const token = await getToken(messaging, {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
  });

  if (!token) return null;

  await supabase
    .from("users")
    .update({ fcm_token: token })
    .eq("user_id", user.id);

  console.log("🔥 FCM token for user", user.id, token);
  return token;
}
