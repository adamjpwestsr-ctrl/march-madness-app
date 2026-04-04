import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getServerClient() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}

export async function GET(req: Request) {
  const supabase = getServerClient();
  const { searchParams } = new URL(req.url);
  const threadId = searchParams.get("threadId");

  const query = supabase
    .from("forum_posts")
    .select(
      `
      id,
      email,
      message,
      thread_id,
      created_at,
      forum_reactions (
        emoji,
        email
      )
    `
    )
    .order("created_at", { ascending: true })
    .limit(200);

  const { data, error } = threadId
    ? await query.eq("thread_id", threadId)
    : await query.is("thread_id", null);

  if (error) {
    console.error("Forum GET error:", error);
    return NextResponse.json({ error: "Failed to load posts" }, { status: 500 });
  }

  return NextResponse.json({ posts: data ?? [] });
}

export async function POST(req: Request) {
  const supabase = getServerClient();

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

  const { message, threadId } = await req.json();

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return NextResponse.json({ error: "Empty message" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("forum_posts")
    .insert({
      email,
      message: message.trim(),
      thread_id: threadId || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Forum POST error:", error);
    return NextResponse.json({ error: "Failed to post" }, { status: 500 });
  }

  return NextResponse.json({ post: data });
}
