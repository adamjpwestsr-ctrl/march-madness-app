// app/proxy.ts — Next.js 16 Auth Guard (replaces middleware.ts)

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define protected routes
  const protectedRoutes = [
    "/home",
    "/challenges",
    "/trivia",
    "/leaderboards",
    "/settings",
  ];

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // If route is not protected, continue normally
  if (!isProtected) {
    return NextResponse.next();
  }

  // Check for your custom session cookie
  const session = request.cookies.get("mm_session")?.value;

  // If no session, redirect to login with return URL
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Otherwise allow request to continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/home/:path*",
    "/challenges/:path*",
    "/trivia/:path*",
    "/leaderboards/:path*",
    "/settings/:path*",
  ],
};
