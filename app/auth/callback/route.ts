// app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect("/login?error=missing_code");
  }

  const supabase = await createSupabaseServerClient();

  // Exchange the code for a session (sets cookie)
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Magic link error:", error);
    return NextResponse.redirect("/login?error=auth_failed");
  }

  return NextResponse.redirect("/bracket");
}
