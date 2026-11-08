import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("live_games")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("LIVE ERROR:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (err: any) {
    console.error("LIVE ROUTE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
