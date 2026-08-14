import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export function createSupabaseServerClient() {
  const cookieStore = cookies(); // ❗ synchronous in Next.js 16

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value ?? null;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, {
            ...options,
            secure: process.env.NODE_ENV === "production",
          });
        },
        remove(name: string, options: any) {
          cookieStore.set(name, "", {
            ...options,
            maxAge: 0,
            secure: process.env.NODE_ENV === "production",
          });
        },
      },
    }
  );
}
