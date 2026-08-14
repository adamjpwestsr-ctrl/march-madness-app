import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export function createSupabaseServerClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const store = await cookies(); // resolves the Promise
          return store.get(name)?.value ?? null;
        },
        async set(name: string, value: string, options: any) {
          const store = await cookies();
          store.set(name, value, {
            ...options,
            secure: process.env.NODE_ENV === "production",
          });
        },
        async remove(name: string, options: any) {
          const store = await cookies();
          store.set(name, "", {
            ...options,
            maxAge: 0,
            secure: process.env.NODE_ENV === "production",
          });
        },
      },
    }
  );
}
