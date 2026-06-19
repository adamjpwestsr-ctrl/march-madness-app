import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Papa from "papaparse";

// ⭐ Add a type for your CSV rows
type ScheduleRow = {
  sport: string;
  week_number: number | string;
  home_team_id: string;
  away_team_id: string;
  game_date: string;
  season_year: number | string;
  [key: string]: any;
};

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json(
      { error: "No file uploaded" },
      { status: 400 }
    );
  }

  const text = await file.text();

  // ⭐ Tell PapaParse what type to return
  const { data: rows, errors } = Papa.parse<ScheduleRow>(text, {
    header: true,
    skipEmptyLines: true,
  });

  if (errors.length > 0) {
    return NextResponse.json(
      { error: "CSV parse error", details: errors },
      { status: 400 }
    );
  }

  // Validate required fields
  const required = [
    "sport",
    "week_number",
    "home_team_id",
    "away_team_id",
    "game_date",
    "season_year",
  ];

  // ⭐ Now row[field] is valid because row is typed
  for (const row of rows) {
    for (const field of required) {
      if (!row[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
  }

  // Insert schedule rows
  const { error: insertError } = await supabase
    .from("sport_schedule")
    .insert(rows);

  if (insertError) {
    return NextResponse.json(
      { error: insertError.message },
      { status: 500 }
    );
  }

  // Auto-generate lock times
  const sport = rows[0].sport;
  const season_year = rows[0].season_year;

  const weeks: Record<number, string[]> = {};

  rows.forEach((row) => {
    const week = Number(row.week_number);
    if (!weeks[week]) weeks[week] = [];
    weeks[week].push(row.game_date);
  });

  const lockRows = Object.entries(weeks).map(([week, dates]) => {
    const earliest = dates.sort()[0];
    const lockTime = new Date(earliest);
    lockTime.setHours(lockTime.getHours() - 1);

    return {
      sport,
      week_number: Number(week),
      season_year,
      lock_time: lockTime.toISOString(),
    };
  });

  const { error: lockError } = await supabase
    .from("sport_lock_times")
    .insert(lockRows);

  if (lockError) {
    return NextResponse.json(
      { error: lockError.message },
      { status: 500 }
    );
  }

  await supabase.from("import_logs").insert({
    sport,
    action: "upload",
    timestamp: new Date().toISOString(),
    row_count: rows.length,
    status: "success",
  });

  return NextResponse.json({
    success: true,
    count: rows.length,
    lock_times_created: lockRows.length,
  });
}

