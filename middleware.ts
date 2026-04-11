// middleware.ts
import { createMiddlewareClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Create a Supabase client that can read + write cookies in Edge runtime
  const supabase = createMiddlewareClient({
    req,
    res,
  });

  // Refresh session if needed (this is the magic)
  await supabase.auth.getSession();

  return res;
}

export const config = {
  matcher: [
    /*
      Protect all authenticated routes.
      You can adjust this list as needed.
    */
    "/bracket/:path*",
    "/admin/:path*",
    "/leaderboard/:path*",
    "/forum/:path*",
  ],
};
