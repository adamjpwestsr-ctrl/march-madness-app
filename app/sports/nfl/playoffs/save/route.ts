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

  // Parse bracket
  const bracket = await req.json();

  // Save bracket
  const { error } = await supabase
    .from("playoff_brackets")
    .upsert({
      season: 2024,
      bracket,
      updated_by: user.email,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
