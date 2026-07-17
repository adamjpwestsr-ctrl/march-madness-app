"use client";

import { useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { getFcmTokenForUser } from "@/utils/firebase";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: dbUser } = await supabase
        .from("users")
        .select("push_notifications")
        .eq("user_id", user.id)
        .maybeSingle();

      if (dbUser?.push_notifications) {
        await getFcmTokenForUser();
      }
    })();
  }, []);

  return <>{children}</>;
}
