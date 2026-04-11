// proxy.ts (Next.js 16 replacement for middleware.ts)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
console.log("🔥 PROXY RAN", request.nextUrl.pathname);
console.log("🍪 REQUEST COOKIES", request.cookies.getAll());

  const response = NextResponse.next();

  // Create Supabase client that can read/write cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set(name, value, options);
        },
        remove(name: string) {
          response.cookies.delete(name);
        },
      },
    }
  );

  // Refresh session so mobile browsers keep cookies alive
  await supabase.auth.getUser();
const { data, error } = await supabase.auth.getUser();
console.log("👤 USER", data, "❌ ERROR", error);

console.log("🍪 RESPONSE COOKIES", response.cookies.getAll());

  return response;
}

export const config = {
  // SAME MATCHER YOU CONFIRMED
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|auth).*)",
  ],
};
