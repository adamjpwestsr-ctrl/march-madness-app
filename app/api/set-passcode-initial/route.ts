// /app/api/set-passcode-initial/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const { email, passcode } = await req.json();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Check if user exists
  const { data: existingUser } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (!existingUser) {
    return NextResponse.json({
      success: false,
      error: "No user found",
    });
  }

  // Update passcode
  const { data: updatedUser, error } = await supabase
    .from("users")
    .update({ passcode })
    .eq("email", email)
    .select()
    .single();

  if (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }

  return NextResponse.json({
    success: true,
    user: updatedUser,
  });
}
