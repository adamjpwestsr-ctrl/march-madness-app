
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const { user_id } = await req.json();

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: "Missing user_id" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: brackets, error } = await supabase
      .from("brackets")
      .select("bracket_id, bracket_name, created_at")
      .eq("user_id", user_id)
      .eq("sport", "ncaab")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("USER BRACKETS ERROR:", error);

      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    const formattedBrackets = (brackets ?? []).map((bracket) => ({
      id: bracket.bracket_id,
      bracket_id: bracket.bracket_id,
      name: bracket.bracket_name,
      created_at: bracket.created_at,
    }));

    return NextResponse.json({
      success: true,
      brackets: formattedBrackets,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown error";

    console.error("USER BRACKETS ROUTE ERROR:", message);

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { success: false, error: "Use POST with user_id." },
    { status: 405 }
  );
}
