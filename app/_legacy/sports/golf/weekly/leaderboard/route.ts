export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();

  // TODO: replace with real scoring aggregation
  // For now, just return a static or minimal list so UI works.
  const { data: users } = await supabase
    .from("users")
    .select("id, display_name, email")
    .limit(10);

  const leaderboard =
    users?.map((u, idx) => ({
      user_id: u.id,
      name: u.display_name || u.email || `User ${idx + 1}`,
      initials: (u.display_name || u.email || "U")
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase(),
      points: 0, // placeholder
    })) ?? [];

  return NextResponse.json({ leaderboard });
}
