
"use client";

import { useMemo } from "react";
import { normalizeSOS } from "@/utils/calculateFavor";

type Team = {
  name?: string;
  seed?: string | number;
  record?: string;
  last10?: string;
  sos?: number | string | null;
  vsTop10?: string;
};

type AnalystTakeProps = {
  teamA: Team;
  teamB: Team;
  favoredTeamName: string | null;
};

type RecordData = {
  wins: number;
  losses: number;
  total: number;
  percentage: number;
};

type Metric = {
  label: string;
  shortLabel: string;
  valueA: number | null;
  valueB: number | null;
  displayA: string;
  displayB: string;
  advantage: "A" | "B" | "EVEN" | "UNKNOWN";
};

const TEAM_A_COLOR = "#22d3ee";
const TEAM_B_COLOR = "#fbbf24";

function parseRecord(value?: string | null): RecordData | null {
  if (!value || typeof value !== "string") return null;

  const match = value.trim().match(/^(\d+)\s*[-–]\s*(\d+)$/);

  if (!match) return null;

  const wins = Number(match[1]);
  const losses = Number(match[2]);
  const total = wins + losses;

  if (total === 0) return null;

  return {
    wins,
    losses,
    total,
    percentage: wins / total,
  };
}

function parseNumeric(value?: number | string | null): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const result = Number(value);

  return Number.isFinite(result) ? result : null;
}

function formatPercent(value: number | null) {
  return value === null ? "N/A" : `${Math.round(value * 100)}%`;
}

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Converts SOS rank into a strength score.
 *
 * Lower SOS rank = tougher schedule = higher strength score.
 *
 * Rank 1   -> 100
 * Rank 75  -> approximately 50
 * Rank 150 -> 0
 *
 * This makes SOS consistent with the other metrics,
 * where a higher score always represents an advantage.
 */
function getSOSScore(value?: number | string | null): number | null {
  const numeric = parseNumeric(value);

  if (numeric === null) return null;

  const rank = normalizeSOS(numeric);

  if (!Number.isFinite(rank)) return null;

  return clamp(((150 - rank) / 149) * 100);
}

function makeMetric(
  label: string,
  shortLabel: string,
  valueA: number | null,
  valueB: number | null,
  displayA: string,
  displayB: string
): Metric {
  let advantage: Metric["advantage"] = "UNKNOWN";

  if (valueA !== null && valueB !== null) {
    const difference = valueA - valueB;

    if (Math.abs(difference) < 0.01) {
      advantage = "EVEN";
    } else {
      advantage = difference > 0 ? "A" : "B";
    }
  }

  return {
    label,
    shortLabel,
    valueA,
    valueB,
    displayA,
    displayB,
    advantage,
  };
}

function getRadarPoints(
  values: number[],
  centerX: number,
  centerY: number,
  radius: number
) {
  const angles = [-90, -18, 54, 126, 198];

  return values.map((value, index) => {
    const angle = (angles[index] * Math.PI) / 180;
    const distance = radius * (clamp(value) / 100);

    return {
      x: centerX + Math.cos(angle) * distance,
      y: centerY + Math.sin(angle) * distance,
    };
  });
}

function pointsToString(points: { x: number; y: number }[]) {
  return points.map((point) => `${point.x},${point.y}`).join(" ");
}

function RadarChart({
  metrics,
  teamAName,
  teamBName,
}: {
  metrics: Metric[];
  teamAName: string;
  teamBName: string;
}) {
  const centerX = 160;
  const centerY = 132;
  const radius = 82;

  const valuesA = metrics.map((metric) => metric.valueA ?? 0);
  const valuesB = metrics.map((metric) => metric.valueB ?? 0);

  const pointsA = getRadarPoints(valuesA, centerX, centerY, radius);
  const pointsB = getRadarPoints(valuesB, centerX, centerY, radius);

  const axes = [
    { x: 160, y: 40 },
    { x: 248, y: 104 },
    { x: 214, y: 211 },
    { x: 106, y: 211 },
    { x: 72, y: 104 },
  ];

  const labels = [
    { x: 160, y: 15, text: "RECORD" },
    { x: 272, y: 99, text: "LAST 10" },
    { x: 225, y: 230, text: "TOP 10" },
    { x: 95, y: 230, text: "SCHEDULE" },
    { x: 48, y: 99, text: "PROFILE" },
  ];

  return (
    <div className="w-full min-w-0">
      <svg
        viewBox="0 0 320 250"
        role="img"
        aria-label={`Radar chart comparing ${teamAName} and ${teamBName} across four statistical categories`}
        className="mx-auto block w-full max-w-[420px]"
      >
        {/* Radar grid */}
        {[25, 50, 75, 100].map((level) => {
          const gridPoints = getRadarPoints(
            [level, level, level, level, level],
            centerX,
            centerY,
            radius
          );

          return (
            <polygon
              key={level}
              points={pointsToString(gridPoints)}
              fill="none"
              stroke="#334155"
              strokeWidth="1"
              opacity={level === 100 ? 0.9 : 0.5}
            />
          );
        })}

        {/* Axis lines */}
        {axes.map((point, index) => (
          <line
            key={index}
            x1={centerX}
            y1={centerY}
            x2={point.x}
            y2={point.y}
            stroke="#475569"
            strokeWidth="1"
          />
        ))}

        {/* Team A */}
        <polygon
          points={pointsToString(pointsA)}
          fill={TEAM_A_COLOR}
          fillOpacity="0.18"
          stroke={TEAM_A_COLOR}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Team B */}
        <polygon
          points={pointsToString(pointsB)}
          fill={TEAM_B_COLOR}
          fillOpacity="0.15"
          stroke={TEAM_B_COLOR}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Team A points */}
        {pointsA.map((point, index) => (
          <circle
            key={`a-${index}`}
            cx={point.x}
            cy={point.y}
            r="3.5"
            fill={TEAM_A_COLOR}
            stroke="#08111f"
            strokeWidth="1.5"
          />
        ))}

        {/* Team B points */}
        {pointsB.map((point, index) => (
          <circle
            key={`b-${index}`}
            cx={point.x}
            cy={point.y}
            r="3.5"
            fill={TEAM_B_COLOR}
            stroke="#08111f"
            strokeWidth="1.5"
          />
        ))}

        {/* Labels */}
        {labels.map((label) => (
          <text
            key={label.text}
            x={label.x}
            y={label.y}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="9"
            fontWeight="700"
            letterSpacing="1"
          >
            {label.text}
          </text>
        ))}
      </svg>

      <div className="mt-1 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: TEAM_A_COLOR }}
          />
          <span className="text-xs font-semibold text-slate-300">
            {teamAName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: TEAM_B_COLOR }}
          />
          <span className="text-xs font-semibold text-slate-300">
            {teamBName}
          </span>
        </div>
      </div>

      <p className="mt-3 text-center text-[10px] leading-relaxed text-slate-500">
        Each axis is independently scaled from 0–100. Missing statistics are
        omitted from the plotted profile rather than treated as zero.
      </p>
    </div>
  );
}

function RecentForm({
  teamAName,
  teamBName,
  recordA,
  recordB,
}: {
  teamAName: string;
  teamBName: string;
  recordA: RecordData | null;
  recordB: RecordData | null;
}) {
  const teams = [
    {
      name: teamAName,
      record: recordA,
      color: TEAM_A_COLOR,
    },
    {
      name: teamBName,
      record: recordB,
      color: TEAM_B_COLOR,
    },
  ];

  return (
    <div className="space-y-4">
      {teams.map((team) => (
        <div key={team.name} className="min-w-0">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="truncate text-xs font-bold text-white">
              {team.name}
            </span>

            {team.record ? (
              <span
                className="shrink-0 text-xs font-bold tabular-nums"
                style={{ color: team.color }}
              >
                {team.record.wins}–{team.record.losses}
              </span>
            ) : (
              <span className="text-xs text-slate-500">Unavailable</span>
            )}
          </div>

          {team.record ? (
            <>
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${team.record.percentage * 100}%`,
                    backgroundColor: team.color,
                  }}
                />

                <div className="h-full flex-1 bg-rose-500/60" />
              </div>

              <div className="mt-1 flex justify-between text-[10px] text-slate-500">
                <span>{team.record.wins} wins</span>
                <span>{team.record.losses} losses</span>
              </div>
            </>
          ) : (
            <div className="h-3 rounded-full bg-slate-800" />
          )}
        </div>
      ))}
    </div>
  );
}

export default function AnalystTake({
  teamA,
  teamB,
  favoredTeamName,
}: AnalystTakeProps) {
  const analysis = useMemo(() => {
    const teamAName = teamA?.name || "Team A";
    const teamBName = teamB?.name || "Team B";

    const overallA = parseRecord(teamA?.record);
    const overallB = parseRecord(teamB?.record);

    const last10A = parseRecord(teamA?.last10);
    const last10B = parseRecord(teamB?.last10);

    const top10A = parseRecord(teamA?.vsTop10);
    const top10B = parseRecord(teamB?.vsTop10);

    const sosA = getSOSScore(teamA?.sos);
    const sosB = getSOSScore(teamB?.sos);

    const metrics: Metric[] = [
      makeMetric(
        "Overall record",
        "Record",
        overallA?.percentage !== undefined
          ? overallA.percentage * 100
          : null,
        overallB?.percentage !== undefined
          ? overallB.percentage * 100
          : null,
        teamA?.record || "N/A",
        teamB?.record || "N/A"
      ),
      makeMetric(
        "Recent form",
        "Last 10",
        last10A?.percentage !== undefined
          ? last10A.percentage * 100
          : null,
        last10B?.percentage !== undefined
          ? last10B.percentage * 100
          : null,
        teamA?.last10 || "N/A",
        teamB?.last10 || "N/A"
      ),
      makeMetric(
        "Strength of schedule",
        "Schedule",
        sosA,
        sosB,
        teamA?.sos != null ? String(teamA.sos) : "N/A",
        teamB?.sos != null ? String(teamB.sos) : "N/A"
      ),
      makeMetric(
        "Against top-10 teams",
        "Top 10",
        top10A?.percentage !== undefined
          ? top10A.percentage * 100
          : null,
        top10B?.percentage !== undefined
          ? top10B.percentage * 100
          : null,
        teamA?.vsTop10 || "N/A",
        teamB?.vsTop10 || "N/A"
      ),
    ];

    const favoredIsA = favoredTeamName === teamAName;
    const favoredIsB = favoredTeamName === teamBName;
    const favoredTeam = favoredIsA
      ? teamAName
      : favoredIsB
        ? teamBName
        : null;

    const favoredAdvantages = metrics.filter(
      (metric) =>
        (favoredIsA && metric.advantage === "A") ||
        (favoredIsB && metric.advantage === "B")
    );

    const opposingAdvantages = metrics.filter(
      (metric) =>
        (favoredIsA && metric.advantage === "B") ||
        (favoredIsB && metric.advantage === "A")
    );

    const evenMetrics = metrics.filter(
      (metric) => metric.advantage === "EVEN"
    );

    const missingMetrics = metrics.filter(
      (metric) => metric.advantage === "UNKNOWN"
    );

    return {
      teamAName,
      teamBName,
      overallA,
      overallB,
      last10A,
      last10B,
      metrics,
      favoredTeam,
      favoredAdvantages,
      opposingAdvantages,
      evenMetrics,
      missingMetrics,
    };
  }, [teamA, teamB, favoredTeamName]);

  const {
    teamAName,
    teamBName,
    last10A,
    last10B,
    metrics,
    favoredTeam,
    favoredAdvantages,
    opposingAdvantages,
    evenMetrics,
    missingMetrics,
  } = analysis;

  const hasModelLean = Boolean(favoredTeam);

  return (
    <section className="relative w-full min-w-0 overflow-hidden rounded-2xl border border-indigo-400/20 bg-gradient-to-br from-[#151b3b] via-[#0c172b] to-[#080f20] shadow-xl shadow-black/20">
      {/* Ambient lighting */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-12 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative min-w-0 space-y-6 p-4 sm:p-5">
        {/* HEADER */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-300/20 bg-indigo-400/10 text-xl text-indigo-200">
            ✦
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300">
              BracketBoss Intelligence
            </p>
            <h3 className="text-lg font-black tracking-tight text-white">
              The Analyst&apos;s Take
            </h3>
            <p className="text-xs text-slate-400">
              A visual breakdown of the matchup
            </p>
          </div>
        </div>

        {/* MODEL LEAN */}
        <div className="rounded-xl border border-indigo-300/20 bg-[#080f20]/70 p-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Current model lean
          </p>

          {hasModelLean ? (
            <>
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <span className="break-words text-xl font-black text-white sm:text-2xl">
                  {favoredTeam}
                </span>

                <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
                  Model edge
                </span>
              </div>

              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                The existing BracketBoss model currently favors {favoredTeam}.
                The visuals below show where that lean has statistical support
                and where the opponent may have an answer.
              </p>
            </>
          ) : (
            <p className="text-sm leading-relaxed text-slate-300">
              The model has not identified either team as the clear favorite.
              Use the statistical comparisons below to explore the matchup.
            </p>
          )}
        </div>

        {/* RADAR CHART */}
        <div className="min-w-0 rounded-xl border border-slate-700/70 bg-[#080f20]/65 p-3 sm:p-4">
          <div className="mb-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
              Team profile
            </p>
            <h4 className="mt-1 text-sm font-bold text-white">
              Four-category comparison
            </h4>
            <p className="mt-1 text-xs text-slate-500">
              See how the teams&apos; statistical profiles differ.
            </p>
          </div>

          <RadarChart
            metrics={metrics}
            teamAName={teamAName}
            teamBName={teamBName}
          />
        </div>

        {/* HEAD-TO-HEAD ADVANTAGE BARS */}
        <div className="min-w-0 rounded-xl border border-slate-700/70 bg-slate-900/55 p-3 sm:p-4">
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
              Head-to-head
            </p>
            <h4 className="mt-1 text-sm font-bold text-white">
              Where the advantage lies
            </h4>
          </div>

          <div className="space-y-4">
            {metrics.map((metric) => {
              const a = metric.valueA;
              const b = metric.valueB;
              const total = a !== null && b !== null ? a + b : 0;
              const shareA = total > 0 ? (a! / total) * 100 : 50;

              return (
                <div key={metric.label} className="min-w-0">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="min-w-0 text-xs font-semibold text-slate-200">
                      {metric.label}
                    </span>

                    <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {metric.advantage === "A"
                        ? teamAName
                        : metric.advantage === "B"
                          ? teamBName
                          : metric.advantage === "EVEN"
                            ? "Even"
                            : "Unavailable"}
                    </span>
                  </div>

                  <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                    {a !== null && b !== null ? (
                      <>
                        <div
                          className="h-full"
                          style={{
                            width: `${shareA}%`,
                            backgroundColor: TEAM_A_COLOR,
                          }}
                        />
                        <div
                          className="h-full flex-1"
                          style={{ backgroundColor: TEAM_B_COLOR }}
                        />
                      </>
                    ) : (
                      <div className="h-full w-full bg-slate-700/70" />
                    )}
                  </div>

                  <div className="mt-1.5 flex justify-between gap-2 text-[10px] tabular-nums">
                    <span style={{ color: TEAM_A_COLOR }}>
                      {metric.displayA}
                    </span>
                    <span style={{ color: TEAM_B_COLOR }}>
                      {metric.displayB}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-slate-700/60 pt-3">
            <span className="flex items-center gap-2 text-[10px] text-slate-400">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: TEAM_A_COLOR }}
              />
              {teamAName}
            </span>
            <span className="flex items-center gap-2 text-[10px] text-slate-400">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: TEAM_B_COLOR }}
              />
              {teamBName}
            </span>
          </div>
        </div>

        {/* RECENT FORM */}
        <div className="min-w-0 rounded-xl border border-slate-700/70 bg-slate-900/55 p-3 sm:p-4">
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
              Recent performance
            </p>
            <h4 className="mt-1 text-sm font-bold text-white">
              Last 10 games
            </h4>
            <p className="mt-1 text-xs text-slate-500">
              Wins and losses shown proportionally; game order is not supplied.
            </p>
          </div>

          <RecentForm
            teamAName={teamAName}
            teamBName={teamBName}
            recordA={last10A}
            recordB={last10B}
          />
        </div>

        {/* ANALYST'S INTERPRETATION */}
        <div className="rounded-xl border border-violet-400/20 bg-violet-400/[0.06] p-3 sm:p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-lg">↗</span>
            <h4 className="text-xs font-black uppercase tracking-[0.16em] text-violet-200">
              What could swing this matchup?
            </h4>
          </div>

          <div className="space-y-3">
            {hasModelLean && favoredAdvantages.length > 0 && (
              <div>
                <p className="text-xs font-bold text-white">
                  Why the model leans toward {favoredTeam}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-300">
                  {favoredAdvantages
                    .map((metric) => metric.label.toLowerCase())
                    .join(", ")}{" "}
                  {favoredAdvantages.length === 1 ? "gives" : "give"}{" "}
                  {favoredTeam} a statistical advantage in the supplied data.
                </p>
              </div>
            )}

            {opposingAdvantages.length > 0 && (
              <div>
                <p className="text-xs font-bold text-white">
                  The opponent&apos;s counterpunch
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-300">
                  {opposingAdvantages
                    .map((metric) => {
                      const leader =
                        metric.advantage === "A" ? teamAName : teamBName;

                      return `${leader} leads in ${metric.label.toLowerCase()}`;
                    })
                    .join("; ")}
                  . These areas could challenge the current model lean.
                </p>
              </div>
            )}

            {evenMetrics.length > 0 && (
              <div>
                <p className="text-xs font-bold text-white">
                  Where the teams are even
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-300">
                  {evenMetrics
                    .map((metric) => metric.label.toLowerCase())
                    .join(", ")}{" "}
                  are closely matched in the available data.
                </p>
              </div>
            )}

            {missingMetrics.length > 0 && (
              <div>
                <p className="text-xs font-bold text-white">
                  What we don&apos;t know yet
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-300">
                  {missingMetrics
                    .map((metric) => metric.label.toLowerCase())
                    .join(", ")}{" "}
                  cannot be compared because one or both values are missing.
                </p>
              </div>
            )}

            <div className="border-t border-violet-300/10 pt-3">
              <p className="text-xs leading-relaxed text-slate-400">
                These four categories provide a useful team profile, but they
                don&apos;t measure injuries, matchup-specific playing styles,
                shooting variance, turnovers, rebounding, or late-game
                execution. Those factors can still change a tournament game.
              </p>
            </div>
          </div>
        </div>

        {/* FOOTNOTE */}
        <div className="border-t border-slate-700/60 pt-3">
          <p className="text-[10px] leading-relaxed text-slate-500">
            BracketBoss compares the statistics supplied for each team.
            Percentages and visual scores are comparative indicators, not
            verified game-winning probabilities. Missing information is
            displayed as unavailable rather than interpreted as zero.
          </p>
        </div>
      </div>
    </section>
  );
}
