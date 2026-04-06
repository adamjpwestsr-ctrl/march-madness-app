import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Convert ET → UTC
function convertETToUTC(etString: string) {
  // Example input: "2027-03-20T12:00"
  const etDate = new Date(`${etString}:00-04:00`); 
  return etDate.toISOString();
}

export async function POST(req: Request) {
  const { lockDateET } = await req.json();

  if (!lockDateET) {
    return NextResponse.json(
      { error: "Missing lockDateET" },
      { status: 400 }
    );
  }

  // -----------------------------
  // AUTH CHECK (cookie → user → is_admin)
  // -----------------------------
  const cookieStore = await cookies();
  const session = cookieStore.get("mm_session");

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { userId } = JSON.parse(session.value);

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const { data: user } = await supabase
    .from("users")
    .select("is_admin")
    .eq("user_id", userId)
    .single();

  if (!user?.is_admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // -----------------------------
  // Convert ET → UTC
  // -----------------------------
  const utcTimestamp = convertETToUTC(lockDateET);

  // -----------------------------
  // Update DB
  // -----------------------------
  const { error } = await supabase
    .from("settings")
    .update({ lock_date: utcTimestamp })
    .eq("id", 1);

  if (error) {
    console.error("Error updating lock_date:", error);
    return NextResponse.json({ error: "DB update failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true, lock_date: utcTimestamp });
}
