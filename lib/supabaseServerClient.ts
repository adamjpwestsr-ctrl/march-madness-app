// lib/supabaseServerClient.ts
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies(); // MUST await in Edge runtime

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
            cookieStore.set({ name, value, ...options });
          } catch {
            // Edge runtime sometimes blocks writes — safe to ignore
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // safe to ignore
          }
        },
      },
    }
  );
}
