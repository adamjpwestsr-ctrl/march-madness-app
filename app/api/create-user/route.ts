
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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Create user API: Missing Supabase server credentials.");
      return NextResponse.json(
        { success: false, error: "Account creation is temporarily unavailable." },
        { status: 500 }
      );
    }

    // Server-side service role client.
    // This allows account creation without depending on anonymous INSERT policies.
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Prevent duplicate accounts, regardless of email capitalization.
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
      return NextResponse.json(
        { success: false, error: "An account already exists for this email." },
        { status: 409 }
      );
    }

    // Create the new account.
    const { data: newUser, error: insertError } = await supabase
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

    if (insertError) {
      console.error("Create user insert failed:", insertError.message);
      return NextResponse.json(
        { success: false, error: "Unable to create your account. Please try again." },
        { status: 500 }
      );
    }

    // Match the session cookie established by the existing login endpoint.
    const safeUser = {
      user_id: newUser.user_id,
      email: newUser.email,
      name: newUser.name,
      username: newUser.username,
      is_admin: newUser.is_admin ?? false,
      favorite_sport: newUser.favorite_sport,
      theme: newUser.theme,
    };

    const response = NextResponse.json({
      success: true,
      user: safeUser,
    });

    response.cookies.set("mm_session", JSON.stringify(safeUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Create user API failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "An unexpected account creation error occurred.",
      },
      { status: 500 }
    );
  }
}
