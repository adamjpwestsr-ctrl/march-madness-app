import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { userId, season } = await req.json();

  const { data } = await supabase
    .from("fantasy_rosters")
    .insert({ user_id: userId, season })
    .select("*")
    .single();

  return NextResponse.json(data);
}
