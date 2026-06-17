import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/login`);
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data?.session) {
    console.error("Magic link callback error:", error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/login`);
  }

  const user = data.session.user;
  const email = user.email?.toLowerCase();

  if (!email) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/login`);
  }

  // Look up user by email
  const { data: dbUser, error: dbError } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (dbError) {
    console.error("DB lookup error:", dbError);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/login`);
  }

  let userRecord = dbUser;

  // If user doesn't exist, create one
  if (!dbUser) {
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

    if (insertError) {
      console.error("User insert error:", insertError);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/login`);
    }

    userRecord = newUser;
  }

  // If user exists but has no username, generate one
  if (userRecord && !userRecord.username) {
    const username = email.split("@")[0];

    await supabase
      .from("users")
      .update({ username })
      .eq("user_id", userRecord.user_id);

    userRecord.username = username;
  }

  // Set session cookie
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

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/bracket`);
}
