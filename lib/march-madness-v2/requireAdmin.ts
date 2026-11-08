import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type AdminResult =
  | { ok: true; supabase: SupabaseClient; userId: number }
  | { ok: false; response: NextResponse };

/** Verify the server-side session against public.users before using service-role access. */
export async function requireMarchMadnessAdmin(): Promise<AdminResult> {
  const cookieStore = await cookies();
  const rawSession = cookieStore.get("mm_session")?.value;

  if (!rawSession) {
    return { ok: false, response: NextResponse.json({ error: "Not authenticated" }, { status: 401 }) };
  }

  let session: { userId?: number | string };
  try {
    session = JSON.parse(rawSession);
  } catch {
    return { ok: false, response: NextResponse.json({ error: "Invalid session" }, { status: 401 }) };
  }

  const userId = Number(session.userId);
  if (!Number.isSafeInteger(userId) || userId <= 0) {
    return { ok: false, response: NextResponse.json({ error: "Invalid session" }, { status: 401 }) };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    return { ok: false, response: NextResponse.json({ error: "Server database configuration is missing" }, { status: 500 }) };
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: user, error } = await supabase
    .from("users")
    .select("is_admin")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("March Madness admin verification failed:", error.message);
    return { ok: false, response: NextResponse.json({ error: "Unable to verify administrator access" }, { status: 500 }) };
  }

  if (!user?.is_admin) {
    return { ok: false, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { ok: true, supabase, userId };
}
