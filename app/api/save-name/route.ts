import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function POST(req: Request) {
  const { email, name } = await req.json();

  const supabase = await createSupabaseServerClient();

  await supabase
    .from("users")
    .update({ name })
    .eq("email", email);

  return NextResponse.json({ success: true });
}
