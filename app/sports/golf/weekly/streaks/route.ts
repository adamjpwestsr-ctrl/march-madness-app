export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

async function getUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user.id;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const userId = await getUserId();

    const { data } = await supabase
      .from("golf_weekly_streaks")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    return NextResponse.json({ streaks: data || null });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const userId = await getUserId();
    const body = await req.json();

    const { current_streak, longest_streak, perfect_season, major_streak } =
      body;

    const { data, error } = await supabase
      .from("golf_weekly_streaks")
      .upsert(
        {
          user_id: userId,
          current_streak,
          longest_streak,
          perfect_season,
          major_streak,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({ streaks: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
