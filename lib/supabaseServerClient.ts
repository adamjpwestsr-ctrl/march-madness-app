// lib/supabaseServerClient.ts
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export function createSupabaseServerClient() {
  // TypeScript currently thinks cookies() returns a Promise.
  // We know at runtime it's the cookie store we want, so we cast.
  const cookieStore = cookies() as any;

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // Treat cookieStore as the synchronous cookie store
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (err) {
            console.error("Error setting cookie:", err);
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (err) {
            console.error("Error removing cookie:", err);
          }
        },
      },
    }
  );
}
