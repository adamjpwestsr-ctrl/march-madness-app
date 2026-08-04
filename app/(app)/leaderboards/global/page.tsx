// app/(app)/leaderboards/global/page.tsx

import { getLeaderboardScores } from "../../../admin/tournament-setup/actions";
import LiveLeaderboardClient from "./LiveLeaderboardClient";

export default async function GlobalLeaderboardPage() {
  const initialScores = await getLeaderboardScores();

  return (
    <LiveLeaderboardClient initialScores={initialScores} />
  );
}
