"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { getFcmTokenForUser } from "@/utils/firebase";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = createSupabaseBrowserClient();
  const [hydratedUser, setHydratedUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ⭐ Always runs — first hook
  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;

      if (mounted && session?.user) {
        setHydratedUser(session.user);
      }

      const { data: listener } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          if (!mounted) return;
          setHydratedUser(session?.user ?? null);
        }
      );

      setLoading(false);

      return () => {
        mounted = false;
        listener.subscription.unsubscribe();
      };
    })();
  }, [supabase]);

  // ⭐ Always runs — second hook
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

  // ⭐ Safe: this is AFTER all hooks
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-400">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
