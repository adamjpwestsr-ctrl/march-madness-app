import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function POST() {
  const supabase = await createSupabaseServerClient();

  // Clear Supabase session
  await supabase.auth.signOut();

  // Clear browser cookies
  return NextResponse.json({ success: true }, {
    headers: {
      "Set-Cookie": "sb-access-token=; Max-Age=0; Path=/;",
      "Set-Cookie": "sb-refresh-token=; Max-Age=0; Path=/;",
    }
  });
}
