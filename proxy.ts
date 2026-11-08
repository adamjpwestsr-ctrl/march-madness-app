
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that must work before a session exists.
const PUBLIC_PATHS = [
  "/login",
  "/logout",
  "/auth",
  "/api/login",
  "/api/login-or-register",
];

function isPublic(path: string) {
  return PUBLIC_PATHS.some(
    (p) => path === p || path.startsWith(`${p}/`)
  );
}

export function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  console.log("PROXY HIT:", pathname);

  // Let public image and font assets load without authentication.
  if (
    /\.(png|jpe?g|gif|svg|webp|ico|woff2?|ttf|otf)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Allow the March Madness login page without mm_session.
  if (pathname === "/sports/march-madness-v2/login") {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-public-route", "march-madness-login");

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Login and registration APIs must not require an existing session.
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  const sessionCookie = req.cookies.get("mm_session");

  if (!sessionCookie) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Preserve the existing admin authorization check.
  if (pathname.startsWith("/admin")) {
    try {
      const parsed = JSON.parse(sessionCookie.value);

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
  matcher: [
    "/((?!_next|static|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|woff2?)$).*)",
  ],
};