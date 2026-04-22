import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export const runtime = "edge";

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  // Get the authenticated user from Supabase Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({
      user: null,
      is_admin: false,
    });
  }

  // Look up the user's admin status in your public.users table
  const { data: profile, error } = await supabase
    .from("users")
    .select("is_admin, email")
    .eq("email", user.email)
    .single();

  // If something goes wrong, fail gracefully
  if (error) {
    return NextResponse.json({
      user,
      is_admin: false,
    });
  }

  return NextResponse.json({
    user,
    is_admin: profile?.is_admin ?? false,
  });
}
