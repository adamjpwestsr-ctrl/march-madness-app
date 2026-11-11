
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { email, passcode } = await req.json();

    if (
      typeof email !== "string" ||
      typeof passcode !== "string" ||
      !email.trim() ||
      !passcode.trim()
    ) {
      return NextResponse.json(
        { success: false, error: "Email and passcode are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedPasscode = passcode.trim();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Find the account regardless of email capitalization.
    const { data: existingUser, error: lookupError } = await supabase
      .from("users")
      .select("user_id")
      .ilike("email", normalizedEmail)
      .maybeSingle();

    if (lookupError) {
      console.error("Initial passcode user lookup failed:", lookupError.message);
      return NextResponse.json(
        { success: false, error: "Unable to verify your email right now." },
        { status: 500 }
      );
    }

    if (!existingUser) {
      return NextResponse.json({
        success: false,
        error: "No user found",
      });
    }

    // Update the exact account we found.
    const { data: updatedUser, error } = await supabase
      .from("users")
      .update({ passcode: trimmedPasscode })
      .eq("user_id", existingUser.user_id)
      .select(
        "user_id, email, name, username, is_admin, favorite_sport, theme"
      )
      .single();

    if (error) {
      console.error("Initial passcode update failed:", error.message);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Set initial passcode API failed:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected passcode setup error occurred." },
      { status: 500 }
    );
  }
}
