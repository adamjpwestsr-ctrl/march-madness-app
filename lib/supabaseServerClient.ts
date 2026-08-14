import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export function createSupabaseServerClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const store = cookies(); // always fresh, always correct type
          return store.get(name)?.value ?? null;
        },
        set(name: string, value: string, options: any) {
          const store = cookies();
          store.set(name, value, {
            ...options,
            secure: process.env.NODE_ENV === "production",
          });
        },
        remove(name: string, options: any) {
          const store = cookies();
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
