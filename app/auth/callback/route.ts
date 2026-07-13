// 🔥 Unified Supabase callback route
// 🔥 Removes mm_session and uses Supabase Auth only
// 🔥 Automatically regenerates FCM token after login

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { getFcmTokenForUser } from "@/utils/firebase";

export async function GET(request: Request) {
  console.log("🔥 CALLBACK ROUTE HIT");

  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/login`);
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data?.session) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/login`);
  }

  const user = data.session.user;
  const email = user.email?.toLowerCase();

  if (!email) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/login`);
  }

  // Look up user in DB
  const { data: dbUser } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  let userRecord = dbUser;

  // Create user if not found
  if (!dbUser) {
    const username = email.split("@")[0];

    const { data: newUser } = await supabase
      .from("users")
      .insert({
        email,
        username,
        name: null,
        is_active: true,
      })
      .select()
      .single();

    userRecord = newUser;
  }

  // Ensure username exists
  if (userRecord && !userRecord.username) {
    const username = email.split("@")[0];

    await supabase
      .from("users")
      .update({ username })
      .eq("user_id", userRecord.user_id);

    userRecord.username = username;
  }

  // Sync Supabase auth cookies
  const response = NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_SITE_URL}/bracket`
  );

  await supabase.auth.setSession(data.session);

  // 🔥 Automatically regenerate FCM token for this user
  await getFcmTokenForUser();

  return response;
}
