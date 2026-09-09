import { NextResponse } from "next/server";
import { getBracket } from "@/app/(app)/sports/march-madness-v2/lib/mm/getBracket";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const seasonYear = Number(searchParams.get("seasonYear"));

  if (!seasonYear) {
    return NextResponse.json(
      { error: "Missing seasonYear" },
      { status: 400 }
    );
  }

  const bracket = await getBracket(seasonYear);

  return NextResponse.json(bracket);
}
