// lib/supabaseServerClient.ts
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Server-side Supabase client for SSR and API routes.
 * Uses anon key for cookie compatibility with browser client.
 * Compatible with Next.js 16 (cookies() is synchronous).
 */
export function createSupabaseServerClient() {
  const cookieStore = cookies(); // ❗ DO NOT await this

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // anon key required for session sync
    {
      cookies: {
        get(name: string) {
          try {
            return cookieStore.get(name)?.value;
          } catch {
            return undefined;
          }
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set(name, value, options);
          } catch {
            // ignore write errors during SSR
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set(name, "", { ...options, maxAge: 0 });
          } catch {
            // ignore write errors during SSR
          }
        },
      },
    }
  );
}
