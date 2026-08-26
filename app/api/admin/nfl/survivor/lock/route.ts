import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseServerClient as createClient } from "@/lib/supabaseServerClient";

export async function POST(req: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase client failed" }, { status: 500 });
  }

  const store = await cookies();
  const raw = store.get("mm_session")?.value;

  if (!raw) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let session;
  try {
    session = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  if (!session.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { week, lock_time } = await req.json();

  if (!week || !lock_time) {
    return NextResponse.json(
      { error: "Missing week or lock_time" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("survivor_weekly_settings")
    .upsert(
      { week_number: week, lock_time },
      { onConflict: "week_number" }
    );

  if (error) {
    console.error("Survivor lock update error:", error);
    return NextResponse.json({ error: "Failed to update lock time" }, { status: 500 });
  }

  await supabase.from("survivor_admin_audit").insert({
    action: "update_lock_time",
    week_number: week,
    lock_time,
    admin_email: session.email,
  });

  return NextResponse.json({ ok: true });
}
