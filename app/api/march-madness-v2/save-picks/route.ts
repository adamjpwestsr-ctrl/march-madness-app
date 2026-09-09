import { NextResponse } from "next/server";
import { savePicks } from "@/app/(app)/sports/march-madness-v2/lib/mm/savePicks";

export async function POST(req: Request) {
  const body = await req.json();

  const result = await savePicks(body);

  return NextResponse.json(result);
}
