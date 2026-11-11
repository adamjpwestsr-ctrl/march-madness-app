
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { name, email, passcode } = await req.json();

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof passcode !== "string"
    ) {
      return NextResponse.json(
        { success: false, error: "Name, email, and passcode are required." },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedPasscode = passcode.trim();

    if (!trimmedName || !normalizedEmail || !trimmedPasscode) {
      return NextResponse.json(
        { success: false, error: "All fields are required." },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Check for an existing account without regard to email capitalization.
    const { data: existingUser, error: lookupError } = await supabase
      .from("users")
      .select("user_id")
      .ilike("email", normalizedEmail)
      .maybeSingle();

    if (lookupError) {
      console.error("Create user lookup failed:", lookupError.message);
      return NextResponse.json(
        { success: false, error: "Unable to verify this email right now." },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: "User already exists",
      });
    }

    // Always save new email addresses in lowercase.
    const { data: newUser, error } = await supabase
      .from("users")
      .insert({
        name: trimmedName,
        email: normalizedEmail,
        passcode: trimmedPasscode,
        is_active: true,
        has_paid: false,
        favorite_sport: "NCAAB",
        theme: "dark",
      })
      .select(
        "user_id, email, name, username, is_admin, favorite_sport, theme"
      )
      .single();

    if (error) {
      console.error("Create user insert failed:", error.message);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: newUser,
    });
  } catch (error) {
    console.error("Create user API failed:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected account creation error occurred." },
      { status: 500 }
    );
  }
}
