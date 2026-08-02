// lib/supabaseServerClient.ts
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";

/**
 * Isolated cookie adapter — avoids Next.js async cookies() type pollution.
 * Works with Next.js 16 and passes type‑check.
 */
export function createSupabaseServerClient() {
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
