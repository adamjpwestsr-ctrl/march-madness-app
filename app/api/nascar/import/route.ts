import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServerClient";
import { parse } from "csv-parse/sync";

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const raceId = formData.get("raceId") as string;

    if (!file || !raceId) {
      return NextResponse.json({ error: "Missing file or raceId" }, { status: 400 });
    }

    const text = await file.text();
    const records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const required = ["driver_name", "led_laps", "stage_wins", "race_win"];
    const missing = required.filter((col) => !records[0]?.hasOwnProperty(col));

    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required columns: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    const payload = records.map((r: any) => {
      const stageWins = parseInt(r.stage_wins || "0", 10);

      if (isNaN(stageWins) || stageWins < 0 || stageWins > 4) {
        throw new Error(`Invalid stage_wins value: ${r.stage_wins}`);
      }

      return {
        race_id: raceId,
        driver_name: r.driver_name,
        driver_id: r.driver_id || r.driver_name.toLowerCase().replace(/\s+/g, "-"),
        led_laps: r.led_laps.toLowerCase() === "true" || r.led_laps === "1",
        stage_wins: stageWins,
        race_win: r.race_win.toLowerCase() === "true" || r.race_win === "1",
      };
    });

    const { error } = await supabase
      .from("nascar_driver_performance")
      .upsert(payload, { onConflict: "race_id,driver_id" });

    if (error) {
      console.error("Error importing NASCAR CSV:", error);
      return NextResponse.json({ error: "Failed to import CSV" }, { status: 500 });
    }

    // Auto-trigger point calculation
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/nascar`, {
      method: "POST",
      body: JSON.stringify({
        type: "calculate-points",
        raceId,
      }),
    });

    return NextResponse.json({ success: true, count: payload.length });
  } catch (err: any) {
    console.error("Import error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
