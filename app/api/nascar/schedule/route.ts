import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServerClient";
import { parse } from "csv-parse/sync";

const MONTH_MAP: Record<string, string> = {
  JAN: "01",
  FEB: "02",
  MAR: "03",
  APR: "04",
  MAY: "05",
  JUN: "06",
  JUL: "07",
  AUG: "08",
  SEP: "09",
  OCT: "10",
  NOV: "11",
  DEC: "12",
};

function normalizeDate(monthStr: string, dayStr: string) {
  const month = MONTH_MAP[monthStr.toUpperCase()];
  const day = dayStr.replace(/[^0-9]/g, "");
  return `2026-${month}-${day.padStart(2, "0")}`;
}

function normalizeTime(timeStr: string) {
  if (!timeStr) return null;

  const [raw, meridian] = timeStr.trim().split(" ");
  const [hourStr, minuteStr] = raw.split(":");

  let hour = parseInt(hourStr, 10);
  const minute = minuteStr ? parseInt(minuteStr, 10) : 0;

  if (meridian?.toUpperCase() === "PM" && hour < 12) hour += 12;
  if (meridian?.toUpperCase() === "AM" && hour === 12) hour = 0;

  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Missing schedule CSV file" }, { status: 400 });
    }

    const text = await file.text();
    const rows = parse(text, {
      skip_empty_lines: true,
      trim: true,
    });

    const payload = [];

    for (const row of rows) {
      const [nameRaw, dateRaw, timeRaw] = row.map((v: string) => v.trim());

      if (!nameRaw || nameRaw.toUpperCase().includes("OFF WEEK")) {
        continue;
      }

      const [monthStr, dayStr] = dateRaw.split(" ");

      const date = normalizeDate(monthStr, dayStr);
      const time = normalizeTime(timeRaw);

      payload.push({
        name: nameRaw,
        date,
        time,
        stages: 3,
        track: nameRaw.includes("(")
          ? nameRaw.split("(")[1].replace(")", "")
          : null,
      });
    }

    const { error } = await supabase
      .from("nascar_races")
      .upsert(payload, { onConflict: "name,date" });

    if (error) {
      console.error("Schedule import error:", error);
      return NextResponse.json({ error: "Failed to import schedule" }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: payload.length });
  } catch (err: any) {
    console.error("Unexpected schedule import error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
