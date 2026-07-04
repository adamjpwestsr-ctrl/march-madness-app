import { NextResponse } from "next/server";
import { submitNascarPick } from "../actions";

export async function POST(req: Request) {
  try {
    const { userId, raceId, driverId } = await req.json();

    // Validate input
    if (!userId || !raceId || !driverId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing userId, raceId, or driverId",
        },
        { status: 400 }
      );
    }

    // Execute pick submission
    const result = await submitNascarPick(userId, raceId, driverId);

    // If submitNascarPick returned an error
    if (!result || result.success === false) {
      return NextResponse.json(
        {
          success: false,
          error: result?.error || "Failed to submit NASCAR pick",
        },
        { status: 500 }
      );
    }

    // SUCCESS — always return a consistent JSON payload
    return NextResponse.json({
      success: true,
      message: "NASCAR pick submitted successfully",
    });
  } catch (err: any) {
    console.error("NASCAR pick route error:", err);

    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Unexpected server error",
      },
      { status: 500 }
    );
  }
}
