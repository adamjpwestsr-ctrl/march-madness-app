export const runtime = "edge";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getServerClient(cookieStore: ReturnType<typeof cookies>) {
  return createServerClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    cookies: cookieStore,
  });
}

export async function GET() {
  const cookieStore = cookies();
  const supabase = getServerClient(cookieStore);

  const { data, error } = await supabase
    .from("forum_threads")
    .select("id, title, created_by, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Thread GET error:", error);
    return NextResponse.json(
      { error: "Failed to load threads" },
      { status: 500 }
    );
  }

  return NextResponse.json({ threads: data ?? [] });
}

export async function POST(req: Request) {
  const cookieStore = cookies();
  const supabase = getServerClient(cookieStore);

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

  const { title } = await req.json();
  if (!title || title.trim().length < 3) {
    return NextResponse.json({ error: "Title too short" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("forum_threads")
    .insert({
      title: title.trim(),
      created_by: email,
    })
    .select()
    .single();

  if (error) {
    console.error("Thread POST error:", error);
    return NextResponse.json(
      { error: "Failed to create thread" },
      { status: 500 }
    );
  }

  return NextResponse.json({ thread: data });
}
