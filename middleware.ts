import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const sessionCookie = req.cookies.get("mm_session");
  const pathname = req.nextUrl.pathname;

  const isLoggedIn = !!sessionCookie;
  const isAdminRoute = pathname.startsWith("/admin");

  // Allow login route always
  if (pathname === "/login" || pathname.startsWith("/api/login")) {
    return NextResponse.next();
  }

  // Not logged in → redirect to login
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Logged in but accessing admin without admin rights
  if (isAdminRoute) {
    try {
      const parsed = JSON.parse(sessionCookie!.value);
      if (!parsed.isAdmin) {
        return NextResponse.redirect(new URL("/bracket", req.url));
      }
    } catch {
      const res = NextResponse.redirect(new URL("/login", req.url));
      res.cookies.delete("mm_session", { path: "/" });
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/bracket/:path*"],
};
