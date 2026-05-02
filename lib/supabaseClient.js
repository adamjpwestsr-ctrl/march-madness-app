import { createClient } from "@supabase/supabase-js";

// Prevent build-time crashes (Turbopack evaluates modules during build)
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only create the client in environments where env vars exist
export const supabase =
  typeof window !== "undefined" && url && anon
    ? createClient(url, anon, {
        auth: {
          persistSession: true,
        },
      })
    : null;
