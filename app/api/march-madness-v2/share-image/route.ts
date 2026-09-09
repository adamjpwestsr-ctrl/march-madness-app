import { NextResponse } from "next/server";
import { generateBracketShareImage } from "@/app/(app)/sports/march-madness-v2/lib/mm/BracketShareImage";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      userName,
      groupName,
      seasonYear,
      championTeam,
    } = body;

    if (!userName || !seasonYear || !championTeam) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const imageBuffer = await generateBracketShareImage({
      userName,
      groupName: groupName || null,
      seasonYear,
      championTeam,
    });

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": "image/png",
      },
    });
  } catch (err) {
    console.error("Share image error:", err);
    return NextResponse.json(
      { error: "Failed to generate share image" },
      { status: 500 }
    );
  }
}
