import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  const cookieStore = await cookies();
  const session = cookieStore.get('mm_session');

  const isLoggedIn = !!session;
  const isAdminRoute = pathname.startsWith('/admin');

  if (!isLoggedIn && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAdminRoute && isLoggedIn) {
    const parsed = JSON.parse(session.value);
    if (!parsed.isAdmin) {
      return NextResponse.redirect(new URL('/bracket', request.url));
    }
  }

  return NextResponse.next();
}
