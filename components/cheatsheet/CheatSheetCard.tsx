
"use client";

import MatchupHeader from "./MatchupHeader";
import FavoredBar from "./FavoredBar";
import HistoricalInsight from "./HistoricalInsight";
import StatsComparison from "./StatsComparison";
import AnalystTake from "./AnalystTake";

import calculateFavor from "@/utils/calculateFavor";
import { TEAM_COLORS } from "@/utils/TEAM_COLORS";
import { TEAM_NAME_MAP } from "@/utils/TEAM_NAME_MAP";

const ROUND_POINTS: Record<number, number> = {
  0: 1,
  1: 1,
  2: 2,
  3: 4,
  4: 8,
  5: 16,
  6: 32,
};

const ROUND_NAMES: Record<number, string> = {
  0: "Opening Round",
  1: "Round of 64",
  2: "Round of 32",
  3: "Sweet 16",
  4: "Elite 8",
  5: "Final Four",
  6: "Championship",
};

const OPENING_ROUND_SEED_BONUS = 14;

type Team = {
  team_name?: string;
  name?: string;
  seed?: number | string | null;
  conference?: string;
  record?: string;
  last_10?: string;
  last10?: string;
  sos?: number | string;
  vs_top_10?: string;
  vsTop10?: string;
  logo_url?: string;
  logo?: string;
};

type Props = {
  teamA: Team;
  teamB: Team;
  round?: number | string | null;
  isTeamAOpeningRound?: boolean;
  isTeamBOpeningRound?: boolean;
};

export default function CheatSheetCard({
  teamA,
  teamB,
  round,
  isTeamAOpeningRound = false,
  isTeamBOpeningRound = false,
}: Props) {
  const safeTeam = (team: Team) => ({
    name: team?.team_name || team?.name || "TBD",
    seed: team?.seed ?? "–",
    conference: team?.conference || "Unknown",
    record: team?.record || "0-0",
    last10: team?.last_10 || team?.last10 || "0-0",
    sos:
      typeof team?.sos === "number"
        ? team.sos
        : parseFloat(String(team?.sos ?? "")) || 0,
    vsTop10: team?.vs_top_10 || team?.vsTop10 || "–",
    logo: team?.logo_url || team?.logo || null,
  });

  const teamAData = safeTeam(teamA);
  const teamBData = safeTeam(teamB);

  // Existing projection algorithm — unchanged.
  const favorResult = calculateFavor(teamAData, teamBData);
  const favoredTeamName = favorResult.favoredTeam;
  const favorPercent = favorResult.percent ?? 50;

  const getColors = (teamName: string) => {
    const official = TEAM_NAME_MAP[teamName] || teamName;

    const colors = Object.prototype.hasOwnProperty.call(
      TEAM_COLORS,
      official
    )
      ? TEAM_COLORS[official as keyof typeof TEAM_COLORS]
      : undefined;

    return (
      colors || {
        primary: "#22c55e",
        secondary: "#0f172a",
      }
    );
  };

  const colorsA = getColors(teamAData.name);
  const colorsB = getColors(teamBData.name);

  const isAFavored = favoredTeamName === teamAData.name;
  const isBFavored = favoredTeamName === teamBData.name;

  const favoredColor = isAFavored
    ? colorsA.primary
    : colorsB.primary;

  const favoredTeam = isAFavored ? teamAData : teamBData;

  // Match the round mapping in recalculate/route.ts.
  const normalizedRound = Number(round);

  const validRound =
    round !== undefined &&
    round !== null &&
    round !== "" &&
    Number.isInteger(normalizedRound) &&
    Object.prototype.hasOwnProperty.call(
      ROUND_POINTS,
      normalizedRound
    );

  const basePoints = validRound
    ? ROUND_POINTS[normalizedRound]
    : null;

  // Only teams confirmed to have played in the actual Opening Round
  // receive the fixed 14-point bonus in subsequent rounds.
  const getSeedBonus = (
    team: typeof teamAData,
    isOpeningRoundTeam: boolean
  ) => {
    if (normalizedRound === 0) return 0;

    if (isOpeningRoundTeam) {
      return OPENING_ROUND_SEED_BONUS;
    }

    const seed = Number(team.seed);

    const hasValidSeed =
      team.seed !== "–" &&
      team.seed !== "" &&
      team.seed !== null &&
      team.seed !== undefined &&
      Number.isInteger(seed) &&
      seed >= 1;

    return hasValidSeed ? seed : 0;
  };

  const getPointsForPick = (
    team: typeof teamAData,
    isOpeningRoundTeam: boolean
  ) => {
    if (basePoints === null) return null;

    return basePoints + getSeedBonus(team, isOpeningRoundTeam);
  };

  const getPointsBreakdown = (
    team: typeof teamAData,
    isOpeningRoundTeam: boolean
  ) => {
    if (basePoints === null) return "";

    if (normalizedRound === 0) {
      return "1 base point";
    }

    if (isOpeningRoundTeam) {
      return `${basePoints} base + ${OPENING_ROUND_SEED_BONUS} Opening Round bonus`;
    }

    const seed = Number(team.seed);

    const hasValidSeed =
      team.seed !== "–" &&
      team.seed !== "" &&
      team.seed !== null &&
      team.seed !== undefined &&
      Number.isInteger(seed) &&
      seed >= 1;

    return hasValidSeed
      ? `${basePoints} base + ${seed} seed`
      : `${basePoints} base`;
  };

  const roundName = validRound
    ? ROUND_NAMES[normalizedRound]
    : "Round unavailable";

  const pointsA = getPointsForPick(
    teamAData,
    isTeamAOpeningRound
  );

  const pointsB = getPointsForPick(
    teamBData,
    isTeamBOpeningRound
  );

  return (
    <div
      className="
        relative isolate flex
        min-h-[760px] w-full min-w-0 flex-col
        overflow-hidden rounded-b-2xl
        bg-[#080f20]
        lg:min-h-[760px]
      "
    >
      {/* AMBIENT TEAM-COLOR LIGHTING */}
      <div
        className="pointer-events-none absolute left-8 top-0 h-40 w-40 rounded-full opacity-[0.08] blur-3xl"
        style={{ backgroundColor: colorsA.primary }}
      />

      <div
        className="pointer-events-none absolute right-8 top-0 h-40 w-40 rounded-full opacity-[0.08] blur-3xl"
        style={{ backgroundColor: colorsB.primary }}
      />

      <div
        className="
          relative flex min-h-0 min-w-0 flex-1 flex-col
          p-2 sm:p-3 lg:p-3
        "
      >
        {/* COMMAND CENTER HEADER */}
        <div className="mb-2 flex shrink-0 items-center justify-between gap-2 border-b border-slate-700/70 pb-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />

            <div className="min-w-0">
              <p className="truncate text-[8px] font-black uppercase tracking-[0.2em] text-cyan-400 sm:text-[9px]">
                BracketBoss Intelligence
              </p>

              <h2 className="text-xs font-black tracking-tight text-white sm:text-sm">
                Matchup Command Center
              </h2>
            </div>
          </div>

          <span className="shrink-0 rounded-full border border-slate-700 bg-slate-800/80 px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-slate-300 sm:text-[9px]">
            {roundName}
          </span>
        </div>

        {/* FOUR QUADRANTS */}
        <div
          className="
            grid min-h-0 min-w-0 flex-1
            grid-cols-1 gap-2
            lg:grid-cols-2
            lg:grid-rows-[270px_420px]
            lg:gap-3
          "
        >
          {/* QUADRANT 1 — MATCHUP & PROJECTION */}
          <section className="relative flex min-h-[245px] min-w-0 flex-col overflow-hidden rounded-xl border border-slate-700/80 bg-[#0b1930] lg:min-h-0">
            <div className="flex shrink-0 items-center justify-between border-b border-slate-700/70 px-2.5 py-1.5 sm:px-3">
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-cyan-400 sm:text-[9px]">
                  01 · The Matchup
                </p>

                <h3 className="mt-0.5 text-xs font-bold text-white sm:text-sm">
                  Team Face-Off
                </h3>
              </div>

              <span className="text-[8px] font-semibold uppercase tracking-wider text-slate-500 sm:text-[9px]">
                Head to Head
              </span>
            </div>

            <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center gap-2 overflow-hidden p-2 sm:p-2.5">
              {/* TEAM NAMES, SEEDS AND LOGOS */}
              <div className="min-w-0 shrink-0">
                <MatchupHeader
                  teamA={teamAData}
                  teamB={teamBData}
                  round={round}
                />
              </div>

              {/* PROJECTED ADVANTAGE */}
              <div className="flex shrink-0 items-center justify-between gap-2 border-t border-slate-700/60 pt-2">
                <div className="min-w-0">
                  <p className="text-[8px] font-bold uppercase tracking-wider text-slate-500">
                    Projected Advantage
                  </p>

                  <p className="truncate text-xs font-black text-white sm:text-sm">
                    {favoredTeam.name}
                  </p>
                </div>

                <div
                  className="shrink-0 rounded-lg border px-2.5 py-1 text-base font-black tabular-nums sm:text-lg"
                  style={{
                    color: favoredColor,
                    borderColor: `${favoredColor}66`,
                    backgroundColor: `${favoredColor}14`,
                  }}
                >
                  {favorPercent}%
                </div>
              </div>

              {/* COMPACT PROJECTION BAR */}
              <div className="min-w-0 shrink-0">
                <FavoredBar
                  teamA={teamAData}
                  teamB={teamBData}
                  compact
                />
              </div>
            </div>
          </section>

          {/* QUADRANT 2 — PICK & POINTS */}
          <section className="flex min-h-[245px] min-w-0 flex-col overflow-hidden rounded-xl border border-amber-400/30 bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 shadow-lg shadow-black/20 lg:min-h-0">
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-amber-400/15 px-2.5 py-1.5 sm:px-3">
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-amber-300 sm:text-[9px]">
                  02 · Pick & Points
                </p>

                <h3 className="mt-0.5 text-xs font-bold text-white sm:text-sm">
                  Reward for a Correct Pick
                </h3>
              </div>

              <span className="shrink-0 rounded-md border border-amber-400/20 bg-amber-400/10 px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-amber-200">
                {roundName}
              </span>
            </div>

            <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden">
              <div className="grid w-full grid-cols-2 items-center gap-2 px-2 py-1.5 sm:gap-3 sm:px-3">
                {/* TEAM A */}
                <div
                  className="flex min-w-0 flex-col items-center justify-center rounded-xl border px-2 py-1.5 text-center"
                  style={{
                    borderColor: `${colorsA.primary}80`,
                    backgroundColor: `${colorsA.primary}12`,
                  }}
                >
                  <p className="max-w-full truncate text-[11px] font-bold text-white sm:text-xs">
                    {teamAData.name}
                  </p>

                  <p
                    className="mt-0.5 text-2xl font-black tabular-nums sm:text-3xl"
                    style={{ color: colorsA.primary }}
                  >
                    {pointsA === null ? "—" : pointsA}
                  </p>

                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                    Points
                  </p>

                  {pointsA !== null && (
                    <p className="mt-0.5 text-center text-[9px] leading-snug text-slate-400">
                      {getPointsBreakdown(
                        teamAData,
                        isTeamAOpeningRound
                      )}
                    </p>
                  )}
                </div>

                {/* TEAM B */}
                <div
                  className="flex min-w-0 flex-col items-center justify-center rounded-xl border px-2 py-1.5 text-center"
                  style={{
                    borderColor: `${colorsB.primary}80`,
                    backgroundColor: `${colorsB.primary}12`,
                  }}
                >
                  <p className="max-w-full truncate text-[11px] font-bold text-white sm:text-xs">
                    {teamBData.name}
                  </p>

                  <p
                    className="mt-0.5 text-2xl font-black tabular-nums sm:text-3xl"
                    style={{ color: colorsB.primary }}
                  >
                    {pointsB === null ? "—" : pointsB}
                  </p>

                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                    Points
                  </p>

                  {pointsB !== null && (
                    <p className="mt-0.5 text-center text-[9px] leading-snug text-slate-400">
                      {getPointsBreakdown(
                        teamBData,
                        isTeamBOpeningRound
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t border-amber-400/15 px-2 py-1.5 sm:px-3">
              <p className="text-center text-[8px] leading-relaxed text-slate-400 sm:text-[9px]">
                Correct picks earn the round value plus the winning team's
                seed. Teams advancing from the Opening Round receive a
                fixed 14-point bonus instead of their seed bonus.
              </p>
            </div>
          </section>

          {/* QUADRANT 3 — TEAM COMPARISON */}
          <section className="flex min-h-[390px] min-w-0 flex-col overflow-hidden rounded-xl border border-slate-700/80 bg-slate-900/80 lg:min-h-0">
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-700/70 px-2.5 py-1.5 sm:px-3">
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-cyan-400 sm:text-[9px]">
                  03 · The Numbers
                </p>

                <h3 className="mt-0.5 text-xs font-bold text-white sm:text-sm">
                  Team Comparison
                </h3>
              </div>

              <span className="text-[8px] font-semibold uppercase tracking-wider text-slate-500 sm:text-[9px]">
                Season Profile
              </span>
            </div>

            {/* MOBILE: CONTENT EXPANDS INTO MAIN PANEL SCROLL.
                DESKTOP: RETAINS INDEPENDENT NUMBERS SCROLL. */}
            <div className="min-h-0 min-w-0 flex-1 overflow-visible p-2 sm:p-3 lg:overflow-y-auto lg:overscroll-contain lg:overflow-x-hidden">
              <StatsComparison
                teamA={teamAData}
                teamB={teamBData}
              />
            </div>
          </section>

          {/* QUADRANT 4 — HISTORICAL CONTEXT & ANALYST */}
          <section className="flex min-h-[390px] min-w-0 flex-col overflow-hidden rounded-xl border border-slate-700/80 bg-slate-900/80 lg:min-h-0">
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-700/70 px-2.5 py-1.5 sm:px-3">
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-purple-400 sm:text-[9px]">
                  04 · The Edge
                </p>

                <h3 className="mt-0.5 text-xs font-bold text-white sm:text-sm">
                  Matchup Intelligence
                </h3>
              </div>

              <span className="rounded-md border border-purple-400/20 bg-purple-400/10 px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-purple-300">
                Key Insights
              </span>
            </div>

            {/* MOBILE: CONTENT EXPANDS INTO MAIN PANEL SCROLL.
                DESKTOP: RETAINS INDEPENDENT EDGE SCROLL. */}
            <div className="min-h-0 min-w-0 flex-1 space-y-2 overflow-visible p-2 sm:space-y-3 sm:p-3 lg:overflow-y-auto lg:overscroll-contain lg:overflow-x-hidden">
              <div>
                <p className="mb-1.5 text-[8px] font-bold uppercase tracking-[0.15em] text-slate-500 sm:text-[9px]">
                  Historical Context
                </p>

                <HistoricalInsight
                  teamA={teamAData}
                  teamB={teamBData}
                />
              </div>

              <div className="border-t border-slate-700/70 pt-2 sm:pt-3">
                <p className="mb-1.5 text-[8px] font-bold uppercase tracking-[0.15em] text-slate-500 sm:text-[9px]">
                  Analyst's Take
                </p>

                <AnalystTake
                  teamA={teamAData}
                  teamB={teamBData}
                  favoredTeamName={favoredTeamName}
                />
              </div>
            </div>
          </section>
        </div>

        {/* FOOTER */}
        <div className="mt-2 flex shrink-0 items-center justify-between gap-2 border-t border-slate-800 pt-2">
          <span className="text-[8px] font-bold uppercase tracking-[0.18em] text-slate-600 sm:text-[9px]">
            BracketBoss Intelligence
          </span>

          <span className="text-[8px] text-slate-600 sm:text-[9px]">
            Matchup analysis · Not a guaranteed outcome
          </span>
        </div>
      </div>
    </div>
  );
}
