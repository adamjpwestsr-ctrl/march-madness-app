import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

/* -------------------- POST: Bulk CSV Import -------------------- */
export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Expect multipart/form-data
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const sport = formData.get("sport") as string;

    if (!file || !sport) {
      return NextResponse.json(
        { error: "CSV file and sport are required." },
        { status: 400 }
      );
    }

    const text = await file.text();

    // Parse CSV
    const rows = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const parsed = rows.map((row) => {
      const parts = row.split(",");

      return {
        question: parts[0]?.trim(),
        answer: parts[1]?.trim(),
        difficulty: parts[2]?.trim(),
        points: Number(parts[3]?.trim()),
      };
    });

    // Validate rows
    const validRows = parsed.filter(
      (r) =>
        r.question &&
        r.answer &&
        r.difficulty &&
        typeof r.points === "number" &&
        !isNaN(r.points)
    );

    if (validRows.length === 0) {
      return NextResponse.json(
        { error: "No valid rows found in CSV." },
        { status: 400 }
      );
    }

    // Insert into DB
    const { error } = await supabase.from("trivia_questions").insert(
      validRows.map((r) => ({
        sport,
        question: r.question,
        answer: r.answer,
        difficulty: r.difficulty,
        points: r.points,
        created_at: new Date().toISOString(),
      }))
    );

    if (error) {
      console.error("CSV import error:", error);
      return NextResponse.json(
        { error: "Failed to import CSV." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        imported: validRows.length,
        skipped: rows.length - validRows.length,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("POST /import error:", err);
    return NextResponse.json(
      { error: "Server error." },
      { status: 500 }
    );
  }
}
