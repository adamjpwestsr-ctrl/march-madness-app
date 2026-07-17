"use client";

import { useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Safe fetch with RLS fallback
        const { data: dbUser, error } = await supabase
          .from("users")
          .select("push_notifications")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.warn("AppShell RLS warning:", error.message);
          return;
        }

        if (dbUser?.push_notifications) {
          // Wrap Firebase call in try/catch
          try {
            const { getFcmTokenForUser } = await import("@/utils/firebase");
            await getFcmTokenForUser();
          } catch (firebaseErr) {
            console.warn("Firebase token error:", firebaseErr);
          }
        }
      } catch (err) {
        console.warn("AppShell error:", err);
      }
    })();
  }, []);

  return <>{children}</>;
}
