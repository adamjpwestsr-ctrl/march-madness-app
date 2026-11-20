
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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error(
        "Initial passcode setup: Missing Supabase server credentials."
      );

      return NextResponse.json(
        {
          success: false,
          error: "Passcode setup is temporarily unavailable.",
        },
        { status: 500 }
      );
    }

    // Use the service-role client, matching create-user.
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Find the existing account regardless of email capitalization.
    const { data: existingUser, error: lookupError } = await supabase
      .from("users")
      .select("user_id, passcode")
      .ilike("email", normalizedEmail)
      .maybeSingle();

    if (lookupError) {
      console.error(
        "Initial passcode user lookup failed:",
        lookupError.message
      );

      return NextResponse.json(
        {
          success: false,
          error: "Unable to verify your email right now.",
        },
        { status: 500 }
      );
    }

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "No user found for this email." },
        { status: 404 }
      );
    }

    // Do not allow this endpoint to overwrite an existing passcode.
    if (
      existingUser.passcode !== null &&
      existingUser.passcode !== ""
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "A passcode has already been set. Please log in.",
        },
        { status: 409 }
      );
    }

    // Update only while the passcode is still unset.
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({ passcode: trimmedPasscode })
      .eq("user_id", existingUser.user_id)
      .or("passcode.is.null,passcode.eq.")
      .select(
        "user_id, email, name, username, is_admin, favorite_sport, theme"
      )
      .maybeSingle();

    if (updateError) {
      console.error(
        "Initial passcode update failed:",
        updateError.message
      );

      return NextResponse.json(
        {
          success: false,
          error: "Unable to save your passcode. Please try again.",
        },
        { status: 500 }
      );
    }

    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          error: "A passcode has already been set. Please log in.",
        },
        { status: 409 }
      );
    }

    // Match the session cookie used by the existing login endpoint.
    const safeUser = {
      user_id: updatedUser.user_id,
      email: updatedUser.email,
      name: updatedUser.name,
      username: updatedUser.username,
      is_admin: updatedUser.is_admin ?? false,
      favorite_sport: updatedUser.favorite_sport,
      theme: updatedUser.theme,
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
    console.error("Set initial passcode API failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "An unexpected passcode setup error occurred.",
      },
      { status: 500 }
    );
  }
}
