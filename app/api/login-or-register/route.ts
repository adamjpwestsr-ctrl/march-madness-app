
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

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: existingUser, error } = await supabase
      .from("users")
      .select(
        "user_id, email, name, username, is_admin, favorite_sport, theme, passcode"
      )
      .eq("email", email.trim())
      .maybeSingle();

    if (error) {
      console.error("Login user lookup failed:", error.message);
      return NextResponse.json(
        { success: false, error: "Unable to verify your login right now." },
        { status: 500 }
      );
    }

    if (!existingUser) {
      return NextResponse.json({
        success: false,
        error: "No user found",
      });
    }

    if (existingUser.passcode == null) {
      return NextResponse.json({
        success: false,
        error: "Passcode not set",
      });
    }

    if (existingUser.passcode !== passcode.trim()) {
      return NextResponse.json({
        success: false,
        error: "Incorrect passcode",
      });
    }

    const safeUser = {
      user_id: existingUser.user_id,
      email: existingUser.email,
      name: existingUser.name,
      username: existingUser.username,
      is_admin: existingUser.is_admin ?? false,
      favorite_sport: existingUser.favorite_sport,
      theme: existingUser.theme,
    };

    const response = NextResponse.json({
      success: true,
      user: safeUser,
    });

    // Establish the session cookie expected by the existing proxy/layout.
    response.cookies.set("mm_session", JSON.stringify(safeUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Login API failed:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected login error occurred." },
      { status: 500 }
    );
  }
}
