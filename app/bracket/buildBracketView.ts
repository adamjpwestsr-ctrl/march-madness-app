// app/bracket/buildBracketView.ts
import { getTeamLogo } from "@/lib/getTeamLogo";

export type BracketGameTeam = {
  name: string | null;
  seed: number | null;
  logoUrl: string | null;
  isUserPick: boolean;
  isWinner: boolean;
  isCorrect: boolean | null;
};

export type BracketGameView = {
  gameId: number;
  round: number;
  region: string | null;
  userPickedTeam: string | null;
  winner: string | null;
  pointsAwarded: number;
  team1: BracketGameTeam;
  team2: BracketGameTeam;
};

export type BracketRoundView = {
  round: number;
  label: string;
  games: BracketGameView[];
};

export type BracketView = {
  bracketId: string;
  bracketName: string;
  username: string;
  totalPoints: number;
  rounds: BracketRoundView[];
};

type BuildArgs = {
  bracket: any;
  user: any;
  games: any[];
  picks: any[];
};

function roundLabel(round: number): string {
  switch (round) {
    case 0:
      return "Opening Round";
    case 1:
      return "Round of 64";
    case 2:
      return "Round of 32";
    case 3:
      return "Sweet 16";
    case 4:
      return "Elite 8";
    case 5:
      return "Final Four";
    case 6:
      return "Championship";
    default:
      return `Round ${round}`;
  }
}

export function buildBracketView({
  bracket,
  user,
  games,
  picks,
}: BuildArgs): BracketView {
  const picksByGameId = new Map<number, any>();
  for (const p of picks) {
    picksByGameId.set(p.game_id, p);
  }

  const gameViews: BracketGameView[] = games.map((g: any) => {
    const pick = picksByGameId.get(g.game_id);
    const userPickedTeam: string | null = pick?.selected_team ?? null;
    const winner: string | null = g.winner ?? null;
    const pointsAwarded: number = pick?.points_awarded ?? 0;

    const isTeam1UserPick = userPickedTeam === g.team1;
    const isTeam2UserPick = userPickedTeam === g.team2;

    const isTeam1Winner = winner === g.team1;
    const isTeam2Winner = winner === g.team2;

    let isCorrect: boolean | null = null;
    if (winner && userPickedTeam) {
      isCorrect = winner === userPickedTeam;
    }

    return {
      gameId: g.game_id,
      round: g.round ?? 0,
      region: g.region ?? null,
      userPickedTeam,
      winner,
      pointsAwarded,
      team1: {
        name: g.team1,
        seed: g.seed1,
        logoUrl: getTeamLogo(g.team1),
        isUserPick: isTeam1UserPick,
        isWinner: isTeam1Winner,
        isCorrect,
      },
      team2: {
        name: g.team2,
        seed: g.seed2,
        logoUrl: getTeamLogo(g.team2),
        isUserPick: isTeam2UserPick,
        isWinner: isTeam2Winner,
        isCorrect,
      },
    };
  });

  const roundsMap = new Map<number, BracketRoundView>();

  for (const gv of gameViews) {
    if (!roundsMap.has(gv.round)) {
      roundsMap.set(gv.round, {
        round: gv.round,
        label: roundLabel(gv.round),
        games: [],
      });
    }
    roundsMap.get(gv.round)!.games.push(gv);
  }

  const rounds = Array.from(roundsMap.values()).sort(
    (a, b) => a.round - b.round
  );

  const totalPoints = picks.reduce(
    (sum: number, p: any) => sum + (p.points_awarded ?? 0),
    0
  );

  const username =
    user.username ||
    (user.email ? user.email.split("@")[0] : `User ${user.user_id}`);

  return {
    bracketId: bracket.bracket_id,
    bracketName: bracket.bracket_name,
    username,
    totalPoints,
    rounds,
  };
}

