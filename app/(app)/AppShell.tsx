"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { getFcmTokenForUser } from "@/utils/firebase";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = createSupabaseBrowserClient();
  const [hydratedUser, setHydratedUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      // ⭐ First hydrate the session
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;

      if (!mounted) return;

      if (session?.user) {
        setHydratedUser(session.user);
      }

      // ⭐ Now listen for changes (login, logout, refresh)
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

  // ⭐ Prevent "not logged in" flash — wait for hydration
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-300">
        Loading...
      </div>
    );
  }

  // ⭐ If user exists, run your push notification logic
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
