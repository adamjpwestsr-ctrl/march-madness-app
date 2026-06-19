import { NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/supabaseServerClient";

export async function GET() {
  const supabase = supabaseServerClient();

  const { data } = await supabase
    .from("trivia_questions")
    .select("*")
    .order("sport", { ascending: true });

  return NextResponse.json(data);
}



