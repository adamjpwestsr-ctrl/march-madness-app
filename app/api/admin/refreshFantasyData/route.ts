import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Sleeper ingestion
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/ingest/sleeper`, {
      method: "POST",
    });

    // nflverse ingestion
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/ingest/nflverse`, {
      method: "POST",
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Refresh failed:", err);
    return NextResponse.json({ ok: false, error: err }, { status: 500 });
  }
}
