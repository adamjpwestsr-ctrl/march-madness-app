import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase
    .from("settings")
    .select("lock_date")
    .eq("id", 1)
    .single();

  if (error) {
    console.error("Error fetching lock_date:", error);
    return NextResponse.json({ lock_date: null }, { status: 200 });
  }

  return NextResponse.json(
    {
      lock_date: data?.lock_date ?? null,
    },
    { status: 200 }
  );
}
