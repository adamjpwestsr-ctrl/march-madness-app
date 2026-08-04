import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: Request) {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("mm_session");

  if (!sessionCookie) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let session;
  try {
    session = JSON.parse(sessionCookie.value);
  } catch {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  const { bracketId, bracketName } = await req.json();

  if (!bracketId || !bracketName) {
    return NextResponse.json(
      { error: "Missing bracketId or bracketName" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("brackets")
    .update({ bracket_name: bracketName })
    .eq("bracket_id", bracketId);

  if (error) {
    console.error("Rename error:", error);
    return NextResponse.json(
      { error: "Failed to rename bracket" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
