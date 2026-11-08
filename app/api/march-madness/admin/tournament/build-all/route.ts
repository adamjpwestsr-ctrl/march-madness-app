import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";

async function call(endpoint: string) {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/march-madness/admin/tournament/${endpoint}`;
  const res = await fetch(url, { method: "POST" });
  return res.json();
}

export async function POST() {
  try {
    const supabase = await createClient();

    const steps: Array<[string, string]> = [
      ["validate", "Initial validation"],
      ["opening-round", "Opening Round"],
      ["round64", "Round of 64"],
      ["round32", "Round of 32"],
      ["sweet16", "Sweet 16"],
      ["elite8", "Elite 8"],
      ["finalfour", "Final Four"],
      ["championship", "Championship"],
      ["validate", "Final validation"],
      ["publish", "Publish Tournament"],
    ];

    const results: any[] = [];

    for (const [endpoint, label] of steps) {
      const result = await call(endpoint);

      results.push({ step: label, result });

      if (result.error) {
        return NextResponse.json(
          {
            ok: false,
            failed_step: label,
            error: result.error,
            details: result,
            results,
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      ok: true,
      message: "Tournament built and published successfully.",
      results,
    });
  } catch (err: any) {
    console.error("build-all route error:", err);
    return NextResponse.json(
      { error: err.message || "Unknown server error." },
      { status: 500 }
    );
  }
}
