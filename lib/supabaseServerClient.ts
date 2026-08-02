// lib/supabaseServerClient.ts
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";

/**
 * Fully isolated cookie adapter that does NOT rely on next/headers cookies().
 * This avoids type pollution from async cookies() in route handlers.
 */
export function createSupabaseServerClient() {
  // Local in-memory cookie store (per request)
  const cookieStore: Record<string, string> = {};

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore[name];
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore[name] = value;
        },
        remove(name: string, options: CookieOptions) {
          delete cookieStore[name];
        },
      },
    }
  );
}
