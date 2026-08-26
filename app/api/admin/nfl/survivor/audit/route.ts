import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseServerClient as createClient } from "@/lib/supabaseServerClient";

export async function GET() {
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

  const { data, error } = await supabase
    .from("survivor_admin_audit")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("Survivor audit load error:", error);
    return NextResponse.json({ error: "Failed to load audit log" }, { status: 500 });
  }

  return NextResponse.json({ rows: data || [] });
}
