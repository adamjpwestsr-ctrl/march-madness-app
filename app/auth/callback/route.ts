// 🔥 Correct Supabase callback route
// 🔥 Ensures auth_id is stored properly
// 🔥 Ensures users table matches Supabase Auth
// 🔥 Ensures Derby, Settings, MyDerbyPicks all see correct user

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function GET(request: Request) {
  console.log("🔥 CALLBACK ROUTE HIT");

  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/login`);
  }

  const supabase = await createSupabaseServerClient();

  // ⭐ Exchange magic link for session
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data?.session) {
    console.error("❌ exchangeCodeForSession error:", error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/login`);
  }

  const authUser = data.session.user;
  const email = authUser.email?.toLowerCase();

  if (!email) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/login`);
  }

  // ⭐ Look up user in DB by email
  const { data: dbUser, error: dbError } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  let userRecord = dbUser;

  // ⭐ Create user if not found
  if (!dbUser) {
    const username = email.split("@")[0];

    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        auth_id: authUser.id,   // ⭐ CRITICAL FIX
        email,
        username,
        name: null,
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      console.error("❌ User insert error:", insertError);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/login`);
    }

    userRecord = newUser;
  }

  // ⭐ Ensure auth_id is always correct
  if (userRecord.auth_id !== authUser.id) {
    await supabase
      .from("users")
      .update({ auth_id: authUser.id })
      .eq("user_id", userRecord.user_id);
  }

  // ⭐ Ensure username exists
  if (!userRecord.username) {
    const username = email.split("@")[0];

    await supabase
      .from("users")
      .update({ username })
      .eq("user_id", userRecord.user_id);

    userRecord.username = username;
  }

  // ⭐ Sync Supabase auth cookies
  const response = NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_SITE_URL}/home`
  );

  await supabase.auth.setSession(data.session);

  return response;
}
