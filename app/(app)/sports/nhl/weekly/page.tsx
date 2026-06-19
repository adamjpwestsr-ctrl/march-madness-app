// app/(app)/sports/nhl/weekly/page.tsx

import { getWeeklyData } from "@/lib/sports/weekly";
import WeeklyClient from "./WeeklyClient";

type Props = {
  searchParams?: { week?: string };
};

export default async function NhlWeeklyPage({ searchParams }: Props) {
  const week = Number(searchParams?.week ?? 1);

  const weeklyData = await getWeeklyData("NHL", week);

  return (
    <WeeklyClient
      sport="NHL"
      week={week}
      games={weeklyData.games}
      teamsById={weeklyData.teamsById}
      lockTime={weeklyData.lockTime}
    />
  );
}

