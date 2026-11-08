
"use client";

import FavoredTooltip from "./FavoredTooltip";
import calculateFavor from "@/utils/calculateFavor";
import { TEAM_COLORS } from "@/utils/TEAM_COLORS";
import { TEAM_NAME_MAP } from "@/utils/TEAM_NAME_MAP";

type Props = {
  teamA: any;
  teamB: any;
  compact?: boolean;
};

export default function FavoredBar({
  teamA,
  teamB,
  compact = false,
}: Props) {
  const result = calculateFavor(teamA, teamB);

  const nameA = teamA?.team_name || teamA?.name || "Team A";
  const nameB = teamB?.team_name || teamB?.name || "Team B";

  const favoredTeam = result?.favoredTeam;
  const rawPercent = Number(result?.percent);

  const percent = Number.isFinite(rawPercent)
    ? Math.max(0, Math.min(100, rawPercent))
    : 50;

  const isTeamA =
    favoredTeam === nameA ||
    (!favoredTeam && percent >= 50);

  const favoredName = isTeamA ? nameA : nameB;
  const otherName = isTeamA ? nameB : nameA;

const getColor = (name: string, fallback: string) => {
  const official = TEAM_NAME_MAP[name] || name;

  const colors = Object.prototype.hasOwnProperty.call(
    TEAM_COLORS,
    official
  )
    ? TEAM_COLORS[official as keyof typeof TEAM_COLORS]
    : undefined;

  return colors?.primary || fallback;
};

  const colorA = getColor(nameA, "#22d3ee");
  const colorB = getColor(nameB, "#818cf8");

  const favoredColor = isTeamA ? colorA : colorB;
  const otherColor = isTeamA ? colorB : colorA;

  // COMPACT VERSION — used inside CheatSheet Quadrant 1.
  if (compact) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-cyan-400/20 bg-[#071426] px-2.5 py-2 sm:px-3">
        <div className="pointer-events-none absolute -left-8 -top-10 h-20 w-20 rounded-full opacity-10 blur-2xl"
          style={{ backgroundColor: favoredColor }}
        />

        <div className="relative">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
              <span className="truncate text-[8px] font-black uppercase tracking-[0.16em] text-cyan-300">
                Model Projection
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500">
                Model view
              </span>
              <FavoredTooltip />
            </div>
          </div>

          <div className="flex h-2.5 w-full overflow-hidden rounded-full border border-white/10 bg-slate-950">
            <div
              className="h-full transition-all duration-700"
              style={{
                width: `${percent}%`,
                background: `linear-gradient(90deg, ${colorA}, ${colorA}cc)`,
              }}
            />

            <div
              className="h-full flex-1 transition-all duration-700"
              style={{
                background: `linear-gradient(90deg, ${colorB}cc, ${colorB})`,
              }}
            />
          </div>

          <div className="mt-1 flex items-center justify-between gap-2">
            <span
              className="truncate text-[10px] font-black tabular-nums"
              style={{ color: colorA }}
            >
              {nameA} · {Math.round(percent)}%
            </span>

            <span
              className="truncate text-right text-[10px] font-black tabular-nums"
              style={{ color: colorB }}
            >
              {nameB} · {Math.round(100 - percent)}%
            </span>
          </div>

          <p className="mt-1 text-[8px] leading-snug text-slate-500">
            Model lean: <span className="font-bold" style={{ color: favoredColor }}>{favoredName}</span>
            {" "}over {otherName}. Projection is an estimate, not a guaranteed result.
          </p>
        </div>
      </div>
    );
  }

  // ORIGINAL FULL-SIZE VERSION — preserved for other uses.
  const favoredPercent = percent;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-cyan-400/20 bg-[#071426] shadow-[0_12px_45px_rgba(0,0,0,0.35)]">
      <div
        className="pointer-events-none absolute -left-16 -top-20 h-48 w-48 rounded-full opacity-15 blur-3xl"
        style={{ backgroundColor: favoredColor }}
      />

      <div
        className="pointer-events-none absolute -bottom-20 -right-16 h-48 w-48 rounded-full opacity-10 blur-3xl"
        style={{ backgroundColor: otherColor }}
      />

      <div className="relative p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-40" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400" />
            </span>

            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300 sm:text-xs">
              BracketBoss Projection
            </span>
          </div>

          <div className="flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/80 px-2.5 py-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Model view
            </span>
            <FavoredTooltip />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-[1fr_auto] items-center gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Current model lean
            </p>

            <h3
              className="mt-2 break-words text-2xl font-black leading-tight tracking-tight sm:text-4xl"
              style={{ color: favoredColor }}
            >
              {favoredName}
            </h3>

            <p className="mt-2 text-xs font-medium text-slate-400 sm:text-sm">
              Projected advantage over {otherName}
            </p>
          </div>

          <div
            className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-2xl border sm:h-28 sm:w-28"
            style={{
              borderColor: `${favoredColor}65`,
              background: `linear-gradient(145deg, ${favoredColor}25, #0b1930 75%)`,
              boxShadow: `0 0 35px ${favoredColor}18`,
            }}
          >
            <span
              className="text-3xl font-black tracking-tight tabular-nums sm:text-4xl"
              style={{ color: favoredColor }}
            >
              {Math.round(favoredPercent)}%
            </span>
            <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Model share
            </span>
          </div>
        </div>

        <div className="mt-7">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="min-w-0 truncate text-xs font-bold text-slate-200">
              {nameA}
            </span>
            <span className="min-w-0 truncate text-right text-xs font-bold text-slate-200">
              {nameB}
            </span>
          </div>

          <div className="relative flex h-4 w-full overflow-hidden rounded-full border border-white/10 bg-slate-950 shadow-inner">
            <div
              className="h-full transition-all duration-700 ease-out"
              style={{
                width: `${percent}%`,
                background: `linear-gradient(90deg, ${colorA}, ${colorA}cc)`,
                boxShadow: `0 0 18px ${colorA}55`,
              }}
            />

            <div
              className="h-full flex-1 transition-all duration-700 ease-out"
              style={{
                background: `linear-gradient(90deg, ${colorB}cc, ${colorB})`,
                boxShadow: `0 0 18px ${colorB}40`,
              }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-sm font-black tabular-nums" style={{ color: colorA }}>
              {Math.round(percent)}%
            </span>
            <span className="text-sm font-black tabular-nums" style={{ color: colorB }}>
              {Math.round(100 - percent)}%
            </span>
          </div>
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-xl border border-white/5 bg-slate-900/70 p-3">
          <span className="mt-0.5 text-lg">✦</span>
          <div>
            <p className="text-xs font-bold text-slate-200">
              What this projection means
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-400 sm:text-xs">
              This is the model&apos;s relative matchup projection based on the
              available team data. It is a decision aid, not a guarantee
              of the game&apos;s result.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
