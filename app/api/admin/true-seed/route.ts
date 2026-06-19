import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { rows } = await req.json();

  if (!rows || !Array.isArray(rows) || rows.length !== 76) {
    return NextResponse.json({ error: "Invalid true seed list" }, { status: 400 });
  }

  // Clear existing list
  const { error: clearError } = await supabase.from("true_seed_list").delete().neq("true_seed", -1);
  if (clearError) {
    console.error(clearError);
    return NextResponse.json({ error: "Failed to clear existing list" }, { status: 500 });
  }

  // Insert new list
  const { error: insertError } = await supabase.from("true_seed_list").insert(rows);
  if (insertError) {
    console.error(insertError);
    return NextResponse.json({ error: "Failed to insert new list" }, { status: 500 });
  }

  return NextResponse.json({ message: "True Seed List saved successfully" });
}



