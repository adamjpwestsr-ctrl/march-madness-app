import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: Request) {
  console.log("🔥 CALLBACK ROUTE HIT");

  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/login`);
  }

  // ⭐ MUST await cookies() in Next.js 16
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

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

  // ⭐ Look up user in DB
  const { data: dbUser } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  let userRecord = dbUser;

  // ⭐ Create user if missing
  if (!dbUser) {
    const username = email.split("@")[0];

    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        auth_id: authUser.id,
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

  // ⭐ Ensure auth_id is correct
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
  }

  // ⭐ Sync Supabase auth cookies BEFORE returning response
  await supabase.auth.setSession(data.session);

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/home`);
}
