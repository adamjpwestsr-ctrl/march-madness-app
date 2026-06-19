import { NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/supabaseServerClient";

export async function POST(req: Request) {
  const { email, name } = await req.json();

  const supabase = supabaseServerClient();

  await supabase
    .from("users")
    .update({ name })
    .eq("email", email);

  return NextResponse.json({ success: true });
}



