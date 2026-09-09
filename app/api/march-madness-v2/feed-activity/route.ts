import { NextResponse } from "next/server";
import { generateFeedActivity } from "@/app/(app)/sports/march-madness-v2/lib/mm/generateFeedActivity";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get("groupId");

  if (!groupId) {
    return NextResponse.json(
      { error: "Missing groupId" },
      { status: 400 }
    );
  }

  const feed = await generateFeedActivity(groupId);

  return NextResponse.json(feed);
}
