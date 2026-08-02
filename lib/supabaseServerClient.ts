import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Server‑side Supabase client for SSR and API routes.
 * Uses anon key for cookie compatibility with browser client.
 */
export function createSupabaseServerClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // ✅ use anon key, not service role
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
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
