import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { email } = await req.json();

  const { data, error } = await supabase
    .from("users")
    .select("user_id, name, username, private_password")
    .eq("email", email)
    .single();

  if (error || !data) {
    return NextResponse.json({
      exists: false,
      needsPasscode: false,
    });
  }

  return NextResponse.json({
    exists: true,
    needsPasscode: !data.private_password,
    name: data.name || null,
    username: data.username || null,
  });
}
