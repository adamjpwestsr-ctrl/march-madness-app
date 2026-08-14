import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies(); // Next.js 16 requires await

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
