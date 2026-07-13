"use client";

import { useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { getFcmTokenForUser } from "@/utils/firebase";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    (async () => {
      // Get logged-in user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if user has push notifications enabled
      const { data: dbUser } = await supabase
        .from("users")
        .select("push_notifications")
        .eq("user_id", user.id)
        .maybeSingle();

      if (dbUser?.push_notifications) {
        await getFcmTokenForUser();   // ⭐ THIS IS STEP 2
      }
    })();
  }, []);

  return <>{children}</>;
}
