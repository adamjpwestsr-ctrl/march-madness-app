import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function POST() {
  const supabase = await createSupabaseServerClient();

  // Clear Supabase session
  await supabase.auth.signOut();

  // Clear cookies properly
  const response = NextResponse.json({ success: true });

  response.headers.append(
    "Set-Cookie",
    "sb-access-token=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax;"
  );
  response.headers.append(
    "Set-Cookie",
    "sb-refresh-token=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax;"
  );

  return response;
}
