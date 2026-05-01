import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protected routes
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

  if (!isProtected) {
    return NextResponse.next();
  }

  const session = req.cookies.get("mm_session")?.value;

  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

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
