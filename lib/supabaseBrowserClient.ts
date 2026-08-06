// lib/supabaseBrowserClient.ts
import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // ✅ Use document.cookie for browser context
          const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
          return match ? match[2] : undefined;
        },
        set(name: string, value: string, options: any) {
          // ✅ Ensure cookie persistence matches server async adapter
          const opts = { path: "/", ...options };
          document.cookie = `${name}=${value}; path=${opts.path}`;
        },
        remove(name: string, options: any) {
          const opts = { path: "/", ...options };
          document.cookie = `${name}=; Max-Age=0; path=${opts.path}`;
        },
      },
    }
  );
}
	