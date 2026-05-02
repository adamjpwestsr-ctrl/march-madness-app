import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();

  // Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Admin check using your REAL users table
  const { data: adminUser } = await supabase
    .from("users")
    .select("is_admin")
    .eq("email", user.email)
    .single();

  if (!adminUser?.is_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const results = await req.json();

  const { error } = await supabase.rpc("award_playoff_points", {
    season_input: 2024,
    results,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
