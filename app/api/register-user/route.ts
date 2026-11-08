import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { name, username, email, passcode } = await req.json();

  const { error } = await supabase.from("users").insert({
    name,
    username: username || null, // <-- ADD THIS
    email,
    private_password: passcode,
    is_active: true,
    has_paid: false,
    favorite_sport: "NCAAB",
    theme: "dark",
  });

  if (error) {
    return NextResponse.json({ success: false, error: error.message });
  }

  return NextResponse.json({ success: true });
}
