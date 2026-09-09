import { NextResponse } from "next/server";
import { generateGroupInvite } from "@/app/(app)/sports/march-madness-v2/lib/mm/generateGroupInvite";

export async function POST(req: Request) {
  const { groupId, email } = await req.json();

  if (!groupId || !email) {
    return NextResponse.json(
      { error: "Missing groupId or email" },
      { status: 400 }
    );
  }

  const invite = await generateGroupInvite(groupId, email);

  return NextResponse.json(invite);
}
