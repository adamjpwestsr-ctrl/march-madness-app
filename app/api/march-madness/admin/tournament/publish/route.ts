import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";

export async function POST() {
  try {
    const supabase = await createClient();

    // 1. Run validation first
    const validateRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/march-madness/admin/tournament/validate`,
      { method: "POST" }
    );

    const validation = await validateRes.json();

    if (!validation.ok) {
      return NextResponse.json(
        {
          error: "Tournament failed validation. Cannot publish.",
          validation,
        },
        { status: 400 }
      );
    }

    // 2. Update tournament_settings
    const { error: updateErr } = await supabase
      .from("tournament_settings")
      .update({
        is_published: true,
        published_at: new Date().toISOString(),
      })
      .neq("id", ""); // update all rows

    if (updateErr) {
      console.error("Failed to publish tournament:", updateErr);
      return NextResponse.json(
        { error: "Failed to publish tournament." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Tournament published successfully.",
      published_at: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("publish route error:", err);
    return NextResponse.json(
      { error: err.message || "Unknown server error." },
      { status: 500 }
    );
  }
}
