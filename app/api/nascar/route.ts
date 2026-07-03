import { NextResponse } from "next/server";
import {
  submitNascarRaceResults,
  calculateNascarPoints,
} from "./actions";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, raceId, results } = body;

    if (!type) {
      return NextResponse.json({ error: "Missing type" }, { status: 400 });
    }

    if (type === "submit-results") {
      if (!raceId || !results) {
        return NextResponse.json(
          { error: "Missing raceId or results" },
          { status: 400 }
        );
      }

      const res = await submitNascarRaceResults(raceId, results);
      return NextResponse.json(res);
    }

    if (type === "calculate-points") {
      if (!raceId) {
        return NextResponse.json(
          { error: "Missing raceId" },
          { status: 400 }
        );
      }

      const res = await calculateNascarPoints(raceId);
      return NextResponse.json(res);
    }

    return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  } catch (err: any) {
    console.error("NASCAR route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
