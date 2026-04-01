import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middlewareHandler(req: NextRequest) {
  const sessionCookie = req.cookies.get('mm_session');
  const pathname = req.nextUrl.pathname;

  const isLoggedIn = !!sessionCookie;
  const isAdminRoute = pathname.startsWith('/admin');

  // Not logged in → redirect to login
  if (!isLoggedIn && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Logged in but accessing admin without admin rights
  if (isAdminRoute && isLoggedIn) {
    try {
      const parsed = JSON.parse(sessionCookie!.value);
      if (!parsed.isAdmin) {
        return NextResponse.redirect(new URL('/bracket', req.url));
      }
    } catch {
      const res = NextResponse.redirect(new URL('/login', req.url));
      res.cookies.delete('mm_session');
      return res;
    }
  }

  return NextResponse.next();
}

export const GET = middlewareHandler;
export const POST = middlewareHandler;
export const PUT = middlewareHandler;
export const PATCH = middlewareHandler;
export const DELETE = middlewareHandler;

export const config = {
  matcher: ['/admin/:path*', '/bracket/:path*'],
};
