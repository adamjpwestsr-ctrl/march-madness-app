import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { questionIds, weekStart } = await req.json();

  if (!Array.isArray(questionIds) || questionIds.length !== 10) {
    return NextResponse.json(
      { error: "Must provide exactly 10 question IDs" },
      { status: 400 }
    );
  }

  await supabase
    .from("weekly_challenges")
    .upsert({
      week_start: weekStart,
      question_ids: questionIds,
    });

  return NextResponse.json({ success: true });
}
