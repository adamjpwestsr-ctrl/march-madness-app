
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const body = await request.json();

    const voterUserId = Number(body.voter_user_id);
    const targetUserId = Number(body.target_user_id);

    if (
      !Number.isSafeInteger(voterUserId) ||
      voterUserId <= 0 ||
      !Number.isSafeInteger(targetUserId) ||
      targetUserId <= 0
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid player information." },
        { status: 400 }
      );
    }

    // A player cannot shame themselves.
    if (voterUserId === targetUserId) {
      return NextResponse.json(
        { success: false, error: "You cannot shame yourself!" },
        { status: 400 }
      );
    }

    // Confirm the voter exists.
    const { data: voter, error: voterError } = await supabase
      .from("users")
      .select("user_id")
      .eq("user_id", voterUserId)
      .maybeSingle();

    if (voterError) {
      console.error("SHAME VOTER LOOKUP ERROR:", voterError);

      return NextResponse.json(
        { success: false, error: voterError.message },
        { status: 500 }
      );
    }

    if (!voter) {
      return NextResponse.json(
        { success: false, error: "Voter account was not found." },
        { status: 404 }
      );
    }

    // Confirm the target exists and is still unpaid.
    const { data: target, error: targetError } = await supabase
      .from("users")
      .select("user_id, has_paid")
      .eq("user_id", targetUserId)
      .maybeSingle();

    if (targetError) {
      console.error("SHAME TARGET LOOKUP ERROR:", targetError);

      return NextResponse.json(
        { success: false, error: targetError.message },
        { status: 500 }
      );
    }

    if (!target) {
      return NextResponse.json(
        { success: false, error: "That player was not found." },
        { status: 404 }
      );
    }

    if (target.has_paid !== false) {
      return NextResponse.json(
        {
          success: false,
          error: "That player is already marked as paid!",
        },
        { status: 409 }
      );
    }

    // Confirm the target has a March Madness bracket.
    const { data: bracket, error: bracketError } = await supabase
      .from("brackets")
      .select("bracket_id")
      .eq("user_id", targetUserId)
      .eq("sport", "ncaab")
      .limit(1)
      .maybeSingle();

    if (bracketError) {
      console.error("SHAME BRACKET LOOKUP ERROR:", bracketError);

      return NextResponse.json(
        { success: false, error: bracketError.message },
        { status: 500 }
      );
    }

    if (!bracket) {
      return NextResponse.json(
        {
          success: false,
          error: "That player does not have a March Madness bracket.",
        },
        { status: 404 }
      );
    }

    // The database primary key prevents repeat votes.
    const { error: insertError } = await supabase
      .from("march_madness_shames")
      .insert({
        voter_user_id: voterUserId,
        target_user_id: targetUserId,
      });

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json(
          {
            success: false,
            error: "You've already shamed this player!",
          },
          { status: 409 }
        );
      }

      console.error("SHAME VOTE INSERT ERROR:", insertError);

      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Shame vote recorded!",
    });
  } catch (err: unknown) {
    console.error("SHAME API ERROR:", err);

    const message =
      err instanceof Error
        ? err.message
        : "An unexpected error occurred.";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
