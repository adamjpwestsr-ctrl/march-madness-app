import { NextResponse } from "next/server";
import { calculateScores } from "@/app/(app)/sports/march-madness-v2/lib/mm/mm_scores_calculator";

export async function POST(req: Request) {
  const body = await req.json();

  const scores = await calculateScores(body.seasonYear, body.groupId);

  return NextResponse.json({ scores });
}
