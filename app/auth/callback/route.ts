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

  // Exchange code for session
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

  // Load user from DB
  const { data: dbUser, error: dbError } = await supabase
    .from("users")
    .select("user_id, email, is_admin")
    .eq("email", email)
    .maybeSingle();

  if (dbError || !dbUser) {
    console.error("DB user lookup error:", dbError);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/login`);
  }

  // SET APP SESSION COOKIE
  const cookieStore = await cookies();
  cookieStore.set(
    "mm_session",
    JSON.stringify({
      userId: dbUser.user_id,
      email: dbUser.email,
      isAdmin: dbUser.is_admin ?? false,
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
