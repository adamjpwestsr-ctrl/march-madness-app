"use client";

import { createBrowserClient } from "@supabase/auth-helpers-nextjs"; // ✅ switch package

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
