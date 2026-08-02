"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { getFcmTokenForUser } from "@/utils/firebase";

/**
 * AppShell hydrates Supabase session before rendering children.
 * Prevents sidebar flash and ensures push notifications only run when logged in.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = createSupabaseBrowserClient();
  const [hydratedUser, setHydratedUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      // ⭐ Hydrate session first
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;

      if (!mounted) return;

      if (session?.user) {
        setHydratedUser(session.user);
      }

      // ⭐ Listen for auth changes
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!mounted) return;
        setHydratedUser(session?.user ?? null);
      });

      setLoading(false);

      return () => {
        mounted = false;
        listener.subscription.unsubscribe();
      };
    })();
  }, [supabase]);

  // ⭐ Prevent sidebar flash — wait for hydration
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-400">
        Loading...
      </div>
    );
  }

  // ⭐ Run push notification logic only when logged in
  useEffect(() => {
    if (!hydratedUser) return;

    (async () => {
      const { data: dbUser } = await supabase
        .from("users")
        .select("push_notifications")
        .eq("user_id", hydratedUser.id)
        .maybeSingle();

      if (dbUser?.push_notifications) {
        await getFcmTokenForUser();
      }
    })();
  }, [hydratedUser, supabase]);

  return <>{children}</>;
}
