import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();

  // Supabase SSR cookie names
  cookieStore.delete("sb-access-token");
  cookieStore.delete("sb-refresh-token");
  cookieStore.delete("supabase-auth-token");

  // Some deployments use this legacy name
  cookieStore.delete("sb:token");

  return NextResponse.json({ status: "loggedOut" });
}
