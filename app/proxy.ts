export const runtime = "edge";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes
const PUBLIC_PATHS = [
  "/login",
  "/logout",
  "/auth",
  "/api/login",
];

function isPublic(path: string) {
  return PUBLIC_PATHS.some((p) => path.startsWith(p));
}

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  console.log("MIDDLEWARE HIT:", pathname);
  console.log("COOKIE RAW:", req.cookies.get("mm_session"));

  // Allow public routes
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  const sessionCookie = req.cookies.get("mm_session");
  const isLoggedIn = !!sessionCookie;

  // Not logged in → redirect to login
  if (!isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin route protection
  if (pathname.startsWith("/admin")) {
    try {
      const parsed = JSON.parse(sessionCookie!.value);
      if (!parsed.isAdmin) {
        return NextResponse.redirect(new URL("/bracket", req.url));
      }
    } catch {
      const res = NextResponse.redirect(new URL("/login", req.url));
      res.cookies.delete("mm_session");
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|static|favicon.ico).*)"],
};
