// app/(app)/sports/nba/weekly/page.tsx
import { getWeeklyData } from '@/lib/sports/weekly';
import WeeklyClient from './WeeklyClient';

type Props = {
  searchParams?: { week?: string };
};

export default async function NbaWeeklyPage({ searchParams }: Props) {
  const week = Number(searchParams?.week ?? 1);

  const weeklyData = await getWeeklyData('NBA', week);

  return (
    <WeeklyClient
      sport="NBA"
      week={week}
      games={weeklyData.games}
      teamsById={weeklyData.teamsById}
      lockTime={weeklyData.lockTime}
    />
  );
}

