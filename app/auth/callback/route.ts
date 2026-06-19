// 🔥 Force Vercel to rebuild this route after auth key fix
// 🔥 Fully instrumented for debugging login issues

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseServerClient } from "@/lib/supabaseServerClient";

export async function GET(request: Request) {
  console.log("🔥 CALLBACK ROUTE HIT");

  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  console.log("➡️ Received code:", code);

  if (!code) {
    console.log("❌ No code found — redirecting to /login");
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/login`);
  }

  // Initialize Supabase client
  console.log("🔧 Initializing Supabase client...");
  const supabase = await supabaseServerClient();

  // Attempt to exchange code for session
  console.log("🔄 Exchanging code for session...");
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  console.log("📦 Exchange result:", { data, error });

  if (error || !data?.session) {
    console.error("❌ Magic link callback error:", error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/login`);
  }

  const user = data.session.user;
  const email = user.email?.toLowerCase();

  console.log("📧 Authenticated email:", email);

  if (!email) {
    console.log("❌ No email found in session — redirecting");
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/login`);
  }

  // Look up user in DB
  console.log("🔍 Looking up user in DB...");
  const { data: dbUser, error: dbError } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  console.log("📦 DB lookup result:", { dbUser, dbError });

  if (dbError) {
    console.error("❌ DB lookup error:", dbError);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/login`);
  }

  let userRecord = dbUser;

  // Create user if not found
  if (!dbUser) {
    console.log("🆕 User not found — creating new user record");

    const username = email.split("@")[0];

    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        email,
        username,
        name: null,
        is_active: true,
      })
      .select()
      .single();

    console.log("📦 Insert result:", { newUser, insertError });

    if (insertError) {
      console.error("❌ User insert error:", insertError);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/login`);
    }

    userRecord = newUser;
  }

  // Ensure username exists
  if (userRecord && !userRecord.username) {
    console.log("🛠 Generating missing username...");

    const username = email.split("@")[0];

    const { error: updateError } = await supabase
      .from("users")
      .update({ username })
      .eq("user_id", userRecord.user_id);

    console.log("📦 Username update result:", { updateError });

    userRecord.username = username;
  }

  // Set session cookie
  console.log("🍪 Setting mm_session cookie...");
  const cookieStore = await cookies();

  cookieStore.set(
    "mm_session",
    JSON.stringify({
      userId: userRecord.user_id,
      email: userRecord.email,
      isAdmin: userRecord.is_admin ?? false,
    }),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    }
  );

  console.log("✅ Cookie set successfully. Redirecting to /bracket");

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/bracket`);
}

