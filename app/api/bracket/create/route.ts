import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: Request) {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    db: { schema: "public" },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  // -----------------------------
  // AUTH: Read mm_session cookie
  // -----------------------------
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

  const userId = session.userId;
  const email = session.email;

  // -----------------------------
  // LOAD EXISTING BRACKETS
  // -----------------------------
  const { data: existing, error } = await supabase
    .from("brackets")
    .select("*")
    .eq("user_id", userId)
    .order("bracket_number", { ascending: true });

  if (error) {
    console.error("Error loading brackets:", error);
    return NextResponse.json(
      { error: "Failed to load brackets" },
      { status: 500 }
    );
  }

  // -----------------------------
  // ENFORCE MAX 4 BRACKETS
  // -----------------------------
  if (existing.length >= 4) {
    return NextResponse.json(
      { error: "Maximum of 4 brackets reached" },
      { status: 409 }
    );
  }

  // -----------------------------
  // DETERMINE NEXT BRACKET NUMBER
  // -----------------------------
  const usedNumbers = existing.map((b) => b.bracket_number).filter(Boolean);
  let nextNumber = 1;
  while (usedNumbers.includes(nextNumber)) {
    nextNumber++;
  }

  // -----------------------------
  // DETERMINE DEFAULT BRACKET NAME
  // -----------------------------
  const defaultName = `${session.username || "My"} Bracket ${nextNumber}`;
  const { bracketName } = await req.json();
  const finalName = bracketName?.trim() || defaultName;

  // -----------------------------
  // INSERT NEW BRACKET (SAFE)
  // -----------------------------
  const { error: insertErr } = await supabase
    .from("brackets")
    .insert([
      {
        user_id: userId,
        email,
        bracket_name: finalName,
        bracket_number: nextNumber,
      },
    ]); // <-- NO returning, NO single(), NO select()

  if (insertErr) {
    console.error("Error creating bracket:", insertErr);
    return NextResponse.json(
      { error: "Failed to create bracket" },
      { status: 500 }
    );
  }

  // -----------------------------
  // SUCCESS
  // -----------------------------
  return NextResponse.json({
    success: true,
    bracketNumber: nextNumber,
    bracketName: finalName,
  });
}

