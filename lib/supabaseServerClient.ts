// lib/supabaseServerClient.ts
import { cookies as nextCookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";

export function createSupabaseServerClient() {
  const store = nextCookies(); // synchronous in Next.js 16

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return store.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            store.set(name, value, options);
          } catch {}
        },
        remove(name: string, options: CookieOptions) {
          try {
            store.set(name, "", { ...options, maxAge: 0 });
          } catch {}
        },
      },
    }
  );
}
