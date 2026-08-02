// lib/supabaseServerClient.ts
import { cookies as nextCookies } from "next/headers";   // ⭐ force alias
import { createServerClient } from "@supabase/ssr";

export function createSupabaseServerClient() {
  // ⭐ cookies() MUST be synchronous — alias prevents auto-import conflicts
  const cookieStore = nextCookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set(name, value, options);
          } catch {
            // ignore SSR write errors
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set(name, "", { ...options, maxAge: 0 });
          } catch {
            // ignore SSR write errors
          }
        },
      },
    }
  );
}
