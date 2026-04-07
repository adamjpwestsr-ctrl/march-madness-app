export const runtime = "edge";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: Request) {
  const cookieStore = await cookies();

  const sessionCookie = cookieStore.get("mm_session");
  if (!sessionCookie) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  let session: any;
  try {
    session = JSON.parse(sessionCookie.value);
  } catch {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  const email = session.email?.toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  const { postId, emoji } = await req.json();
  if (!postId || !emoji) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // EDGE-SAFE SUPABASE CLIENT
  const supabase = createServerClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    cookies: cookieStore,
  });

  const { error } = await supabase.from("forum_reactions").insert({
    post_id: postId,
    email,
    emoji,
  });

  if (error) {
    console.error("Reaction error:", error);
    return NextResponse.json({ error: "Failed to react" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
