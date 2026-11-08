import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const { name, email, passcode } = await req.json();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Check if user already exists
  const { data: existingUser } = await supabase
    .from("users")
    .select("email")
    .eq("email", email)
    .single();

  if (existingUser) {
    return NextResponse.json({
      success: false,
      error: "User already exists",
    });
  }

  // Create new user
  const { data: newUser, error } = await supabase
    .from("users")
    .insert({
      name,
      email,
      passcode,
      is_active: true,
      has_paid: false,
      favorite_sport: "NCAAB",
      theme: "dark",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message });
  }

  return NextResponse.json({ success: true, user: newUser });
}
