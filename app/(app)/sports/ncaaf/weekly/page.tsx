// app/(app)/sports/ncaaf/weekly/page.tsx

import WeeklyShell from "./WeeklyShell";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function NcaafWeeklyPage() {
  const supabase = await createSupabaseServerClient();
  // ...existing data loading logic...

  return (
    <div className="min-h-screen text-white p-6">
      <WeeklyShell
        seasonYear={seasonYear}
        week={week}
        games={games}
        teamsById={teamsById}
        lockTime={lockTime}
        allWeeks={allWeeks}
        prevWeek={prevWeek}
        nextWeek={nextWeek}
      />
    </div>
  );
}
