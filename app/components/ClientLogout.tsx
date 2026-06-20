// app/components/ClientLogout.tsx
"use client";

import { useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function ClientLogout() {
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase.auth.signOut(); // clears browser local storage + cookies
  }, []);

  return null;
}
