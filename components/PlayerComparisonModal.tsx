"use client";

import React from "react";
import Badge from "./Badge"; // ⭐ NEW: badge component import

export default function PlayerComparisonModal({
  open,
  onClose,
  playerA,
  playerB,
}: {
  open: boolean;
  onClose: () => void;
  playerA: any;
  playerB: any;
}) {
  if (!open || !playerA || !playerB) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl w-full max-w-5xl">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">
          Player Comparison
        </h2>

        <div className="grid grid-cols-2 gap-6">
          <ComparisonCard player={playerA} label="Player A" />
          <ComparisonCard player={playerB} label="Player B" />
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function ComparisonCard({
  player,
  label,
}: {
  player: any;
  label: string;
}) {
  return (
    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
      <h3 className="text-xl font-semibold text-white mb-1">{label}</h3>

      <p className="text-slate-400 mb-2">
        {player.name} • {player.team} • {player.position}
      </p>

      {/* ⭐ NEW: Badge Row */}
      <div className="flex gap-2 mb-4">
        <Badge type="tier" value={player.badge_tier ?? ""} />
        <Badge type="role" value={player.badge_role ?? ""} />
        <Badge type="archetype" value={player.badge_archetype ?? ""} />
      </div>

      {/* Matchup Difficulty */}
      <MatchupDifficulty
        difficulty={player.matchup_difficulty}
        rank={player.defense_rank}
      />

      {/* Radar Chart */}
      <div className="mb-6">
        <h4 className="text-slate-300 font-semibold mb-2">Performance Radar</h4>
        <RadarChart player={player} />
      </div>

      {/* Sparkline Trends */}
      <div className="mb-6">
        <h4 className="text-slate-300 font-semibold mb-2">Trend Lines</h4>

        <TrendRow label="Fantasy Points" data={player.trend_fantasy || [5, 12, 8, 14]} />
        <TrendRow label="Snap %" data={player.trend_snap || [60, 72, 68, 75]} />
        <TrendRow label="Target Share" data={player.trend_target || [0.12, 0.18, 0.15, 0.22]} />
        <TrendRow label="Red Zone Usage" data={player.trend_redzone || [1, 2, 1, 3]} />
      </div>

      {/* Fantasy Overview */}
      <Section title="Fantasy Overview">
        <Stat label="Projected Points" value={player.projected_points} />
        <Stat label="Last Week Points" value={player.last_week_points} />
        <Stat label="Season Points" value={player.season_points} />
      </Section>

      {/* Usage Metrics */}
      <Section title="Usage Metrics">
        <BarStat label="Snap %" value={player.snap_pct} max={100} color="bg-emerald-500" />
        <BarStat label="Target Share" value={player.target_share * 100} max={100} color="bg-blue-500" />
        <BarStat label="Red Zone Usage" value={player.redzone_usage} max={10} color="bg-red-500" />
      </Section>

      {/* Advanced Stats */}
      <Section title="Advanced Stats">
        <Stat label="Pass Yards" value={player.pass_yards} />
        <Stat label="Rush Yards" value={player.rush_yards} />
        <Stat label="Receiving Yards" value={player.rec_yards} />
        <Stat label="Touchdowns" value={player.touchdowns} />
      </Section>
    </div>
  );
}

/* -------------------------------------------------------
   Matchup Difficulty Indicator
------------------------------------------------------- */

function MatchupDifficulty({
  difficulty,
  rank,
}: {
  difficulty: string;
  rank: number;
}) {
  const colors: Record<string, string> = {
    easy: "bg-emerald-600 text-white",
    medium: "bg-yellow-500 text-black",
    hard: "bg-red-600 text-white",
  };

  const label: Record<string, string> = {
    easy: "Easy Matchup",
    medium: "Average Matchup",
    hard: "Hard Matchup",
  };

  return (
    <div className="mb-4">
      <h4 className="text-slate-300 font-semibold mb-2">Matchup Difficulty</h4>

      <div className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold ${colors[difficulty]}`}>
        {label[difficulty]} • DEF Rank {rank}
      </div>

      <p className="text-slate-400 text-xs mt-1">
        Lower defensive rank = tougher matchup
      </p>
    </div>
  );
}

/* -------------------------------------------------------
   Section + Stats
------------------------------------------------------- */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <h4 className="text-slate-300 font-semibold mb-2">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: any;
}) {
  return (
    <div className="flex justify-between text-slate-300 text-sm">
      <span>{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}

function BarStat({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = Math.min(100, (value / max) * 100);

  return (
    <div>
      <div className="flex justify-between text-slate-300 text-sm mb-1">
        <span>{label}</span>
        <span className="font-semibold text-white">{value.toFixed(1)}</span>
      </div>

      <div className="w-full bg-slate-700 rounded h-2 overflow-hidden">
        <div className={`${color} h-2`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   Radar Chart (Pure SVG)
------------------------------------------------------- */

function RadarChart({
  player,
}: {
  player: any;
}) {
  const metrics = [
    { label: "Snap %", value: player.snap_pct, max: 100 },
    { label: "Target Share", value: player.target_share * 100, max: 100 },
    { label: "Red Zone", value: player.redzone_usage, max: 10 },
    { label: "Pass Yds", value: player.pass_yards, max: 400 },
    { label: "Rush Yds", value: player.rush_yards, max: 200 },
    { label: "Rec Yds", value: player.rec_yards, max: 200 },
    { label: "TDs", value: player.touchdowns, max: 5 },
  ];

  const size = 220;
  const center = size / 2;
  const radius = 80;

  const points = metrics.map((m, i) => {
    const angle = (Math.PI * 2 * i) / metrics.length;
    const pct = Math.min(1, m.value / m.max);
    const r = pct * radius;

    return [center + r * Math.cos(angle), center + r * Math.sin(angle)];
  });

  const polygon = points.map((p) => p.join(",")).join(" ");

  return (
    <svg width={size} height={size} className="mx-auto">
      {[0.33, 0.66, 1].map((r, i) => (
        <circle
          key={i}
          cx={center}
          cy={center}
          r={radius * r}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
          fill="none"
        />
      ))}

      {metrics.map((_, i) => {
        const angle = (Math.PI * 2 * i) / metrics.length;
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={center + radius * Math.cos(angle)}
            y2={center + radius * Math.sin(angle)}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1"
          />
        );
      })}

      <polygon
        points={polygon}
        fill="rgba(0, 200, 255, 0.35)"
        stroke="rgba(0, 200, 255, 0.9)"
        strokeWidth="2"
      />

      {metrics.map((m, i) => {
        const angle = (Math.PI * 2 * i) / metrics.length;
        const lx = center + (radius + 20) * Math.cos(angle);
        const ly = center + (radius + 20) * Math.sin(angle);

        return (
          <text
            key={i}
            x={lx}
            y={ly}
            fill="white"
            fontSize="10"
            textAnchor="middle"
          >
            {m.label}
          </text>
        );
      })}
    </svg>
  );
}

/* -------------------------------------------------------
   Sparkline Trend Chart (Pure SVG)
------------------------------------------------------- */

function TrendRow({
  label,
  data,
}: {
  label: string;
  data: number[];
}) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-slate-300 text-sm mb-1">
        <span>{label}</span>
        <span className="text-white font-semibold">
          {data[data.length - 1].toFixed(1)}
        </span>
      </div>
      <Sparkline data={data} />
    </div>
  );
}

function Sparkline({
  data,
}: {
  data: number[];
}) {
  const width = 200;
  const height = 40;

  const max = Math.max(...data);
  const min = Math.min(...data);

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / (max - min || 1)) * height;
      return `${x},${y}`;
    })
    .join(" ");

  const trend = data[data.length - 1] - data[0];
  const trendColor =
    trend > 0
      ? "rgba(0,255,120,0.9)"
      : trend < 0
      ? "rgba(255,80,80,0.9)"
      : "rgba(80,160,255,0.9)";

  return (
    <svg width={width} height={height}>
      <polyline
        points={points}
        fill="none"
        stroke={trendColor}
        strokeWidth="2"
      />
      <circle
        cx={width}
        cy={height - ((data[data.length - 1] - min) / (max - min || 1)) * height}
        r="3"
        fill={trendColor}
      />
    </svg>
  );
}
