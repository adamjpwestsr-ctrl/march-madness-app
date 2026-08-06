export const runtime = "edge";

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) return NextResponse.redirect("/login");

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect("/login");
  }

  // ⭐ MUST explicitly attach cookies to the response in Edge runtime
  const response = NextResponse.redirect("/home");

  const { access_token, refresh_token } = data.session;

  response.headers.append(
    "Set-Cookie",
    `sb-access-token=${access_token}; Path=/; HttpOnly; Secure; SameSite=Lax`
  );

  response.headers.append(
    "Set-Cookie",
    `sb-refresh-token=${refresh_token}; Path=/; HttpOnly; Secure; SameSite=Lax`
  );

  return response;
}
