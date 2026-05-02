"use client";

import { useEffect, useMemo, useState } from "react";

const WEEKS = Array.from({ length: 17 }, (_, i) => i + 1);

type Team = {
  id: string;
  name: string;
  abbreviation?: string;
  logo_url: string | null;
};

type Pick = {
  week: number;
  team_id: string;
};

type LeaderboardEntry = {
  rank: number;
  name: string;
  total_points: number;
  week_points: number;
  rank_change: number;
};

type Settings = {
  current_week: number;
  lock_time: string;
};

export default function WeeklyClient({
  teams,
  user,
  picks,
  leaderboard,
  settings,
}: {
  teams: Team[];
  user: any;
  picks: Pick[];
  leaderboard: LeaderboardEntry[];
  settings: Settings | null;
}) {
  const [currentWeek, setCurrentWeek] = useState<number>(
    settings?.current_week || 1
  );
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const lockTime = settings?.lock_time ? new Date(settings.lock_time) : null;
  const now = new Date();
  const isLocked = lockTime ? now >= lockTime : false;

  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);

  // Countdown timer
  useEffect(() => {
    if (!lockTime || isLocked) {
      setTimeRemaining(null);
      return;
    }

    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = lockTime.getTime() - now;

      if (diff <= 0) {
        setTimeRemaining(null);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [lockTime, isLocked]);

  const picksByWeek = useMemo(() => {
    const map = new Map<number, string>();
    picks.forEach((p) => map.set(p.week, p.team_id));
    return map;
  }, [picks]);

  const usedTeamIds = useMemo(() => {
    const used = new Set<string>();
    picks.forEach((p) => {
      if (p.week < currentWeek) used.add(p.team_id);
    });
    return used;
  }, [picks, currentWeek]);

  useEffect(() => {
    const existing = picksByWeek.get(currentWeek) || null;
    setSelectedTeamId(existing);
  }, [currentWeek, picksByWeek]);

  const canPickThisWeek = useMemo(() => {
    if (!settings) return false;
    if (currentWeek > settings.current_week) return false;
    if (currentWeek < settings.current_week) return false;
    if (isLocked) return false;
    return true;
  }, [settings, currentWeek, isLocked]);

  const handleSelectTeam = (teamId: string) => {
    if (!canPickThisWeek) return;
    if (usedTeamIds.has(teamId)) return;
    setSelectedTeamId(teamId);
  };

  const handleSubmit = async () => {
    if (!selectedTeamId || !user) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/nfl/weekly/pick", {
        method: "POST",
        body: JSON.stringify({
          week: currentWeek,
          teamId: selectedTeamId,
        }),
      });
      if (!res.ok) {
        alert("Error saving pick");
        return;
      }
      alert("Pick saved!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatLockBanner = () => {
    if (!lockTime) return "Lock time not set.";
    return lockTime.toLocaleString("en-US", {
      weekday: "long",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">

      {/* ⭐ GLOBAL LOCK BANNER */}
      <div
        className={`mb-6 rounded-xl border px-4 py-3 text-sm md:text-base flex items-center justify-between ${
          isLocked
            ? "border-red-500/60 bg-red-950/40 text-red-200"
            : "border-emerald-500/60 bg-emerald-950/40 text-emerald-100"
        }`}
      >
        <div className="font-semibold">
          {isLocked
            ? "Week Locked — Picks are closed."
            : "Lock in your pick before kickoff — don’t take the L."}
        </div>

        <div className="ml-4 text-xs md:text-sm opacity-90 text-right">
          {lockTime ? `Picks lock ${formatLockBanner()}` : "Lock time not set"}

          {!isLocked && timeRemaining && (
            <div className="text-[0.65rem] text-emerald-300 mt-1">
              {timeRemaining} until lock
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* ⭐ LEFT COLUMN — WEEK SELECTOR + HISTORY */}
        <div className="lg:col-span-1 space-y-8">

          {/* WEEK SELECTOR */}
          <div className="bg-slate-900/80 border border-slate-700/70 rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-4">Week</h2>
            <div className="grid grid-cols-4 gap-2">
              {WEEKS.map((week) => {
                const isFuture =
                  settings && week > settings.current_week ? true : false;
                const isPast =
                  settings && week < settings.current_week ? true : false;
                const userPick = picksByWeek.get(week);
                const isCurrent = week === currentWeek;

                return (
                  <button
                    key={week}
                    onClick={() => {
                      if (isFuture) return;
                      setCurrentWeek(week);
                    }}
                    className={`relative px-2 py-2 rounded-lg text-xs font-semibold border transition
                      ${
                        isCurrent
                          ? "border-emerald-400 bg-emerald-500/10 text-emerald-200"
                          : "border-slate-700 bg-slate-900 hover:border-emerald-400"
                      }
                      ${isFuture ? "opacity-40 cursor-not-allowed" : ""}
                    `}
                  >
                    <div>W{week}</div>
                    {userPick && (
                      <div className="mt-1 text-[0.6rem] text-slate-400 truncate">
                        Picked
                      </div>
                    )}
                    {isPast && !userPick && (
                      <div className="mt-1 text-[0.6rem] text-red-400">
                        No pick
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ⭐ MY PICKS HISTORY */}
          <div className="bg-slate-900/80 border border-slate-700/70 rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-4">My Picks History</h2>

            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {WEEKS.map((week) => {
                const teamId = picksByWeek.get(week);
                const team = teams.find((t) => t.id === teamId);

                return (
                  <div
                    key={week}
                    className="flex items-center justify-between rounded-lg bg-slate-800/80 px-3 py-2 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 w-5 text-right">W{week}</span>

                      {team ? (
                        <>
                          <img
                            src={team.logo_url || ""}
                            alt={team.name}
                            className="h-5 w-5 object-contain"
                          />
                          <span className="font-semibold">{team.name}</span>
                        </>
                      ) : (
                        <span className="text-slate-500 italic">No pick</span>
                      )}
                    </div>

                    {week < currentWeek && (
                      <span className="text-[0.65rem] text-slate-400">Locked</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* ⭐ MIDDLE — TEAM GRID */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-700/70 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              Week {currentWeek} — Select Your Team
            </h2>
            <div className="text-xs text-slate-400">
              {canPickThisWeek
                ? "You can change your pick until lock."
                : currentWeek < (settings?.current_week || 1)
                ? "Past week — picks are read-only."
                : currentWeek > (settings?.current_week || 1)
                ? "Future week — not open yet."
                : "Locked — picks are closed."}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {teams.map((team) => {
              const isUsed = usedTeamIds.has(team.id);
              const isSelected = selectedTeamId === team.id;
              const disabled =
                isUsed || !canPickThisWeek || currentWeek < (settings?.current_week || 1);

              return (
                <button
                  key={team.id}
                  onClick={() => handleSelectTeam(team.id)}
                  disabled={disabled}
                  className={`
                    relative group rounded-xl border p-3 flex flex-col items-center justify-center text-center transition
                    ${
                      isSelected
                        ? "border-emerald-400 bg-emerald-500/10 shadow-[0_0_0_1px_rgba(16,185,129,0.4)]"
                        : "border-slate-700 bg-slate-900 hover:border-emerald-400 hover:bg-slate-800"
                    }
                    ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
                    ${isUsed ? "opacity-40 grayscale" : ""}
                  `}
                >
                  {isUsed && (
                    <span className="pointer-events-none absolute inset-0">
                      <span className="absolute left-[-10%] top-1/2 h-[2px] w-[120%] border-t-2 border-red-500/80 shadow-[0_0_4px_rgba(248,113,113,0.8)] rotate-[-20deg]" />
                    </span>
                  )}

                  {team.logo_url ? (
                    <img
                      src={team.logo_url}
                      alt={team.name}
                      className="h-10 w-10 mb-2 object-contain"
                    />
                  ) : (
                    <div className="h-10 w-10 mb-2 rounded-full bg-slate-800" />
                  )}

                  <div className="text-xs font-semibold">{team.name}</div>

                  {isUsed && (
                    <div className="mt-1 text-[0.6rem] text-red-300">
                      Already used
                    </div>
                  )}
                  {isSelected && !isUsed && (
                    <div className="mt-1 text-[0.6rem] text-emerald-300">
                      Selected
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={!canPickThisWeek || !selectedTeamId || isSubmitting}
              className={`
                px-4 py-2 rounded-lg text-sm font-semibold transition
                ${
                  !canPickThisWeek || !selectedTeamId || isSubmitting
                    ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white"
                }
              `}
            >
              {isSubmitting ? "Saving..." : "Save Pick"}
            </button>
          </div>
        </div>

        {/* ⭐ RIGHT COLUMN — LOCK PANEL + LEADERBOARD */}
        <div className="space-y-8">

          {/* LOCK PANEL */}
          <div className="bg-slate-900/80 border border-slate-700/70 rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-2">Weekly Lock</h2>

            <div className="text-sm text-slate-300">
              {lockTime ? `Picks lock ${formatLockBanner()}` : "Lock time not set"}
            </div>

            {!isLocked && timeRemaining && (
              <div className="text-xs text-emerald-300 mt-1">
                {timeRemaining} until lock
              </div>
            )}

            {isLocked && (
              <div className="text-xs text-red-400 mt-1">
                Week is locked — picks are closed
              </div>
            )}
          </div>

          {/* LEADERBOARD */}
          <div className="bg-slate-900/80 border border-slate-700/70 rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-4">Leaderboard</h2>
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {leaderboard.map((entry: LeaderboardEntry, idx: number) => {
                const arrow =
                  entry.rank_change > 0
                    ? "↑"
                    : entry.rank_change < 0
                    ? "↓"
                    : "→";
                const arrowColor =
                  entry.rank_change > 0
                    ? "text-emerald-400"
                    : entry.rank_change < 0
                    ? "text-red-400"
                    : "text-slate-400";

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg bg-slate-800/80 px-3 py-2 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 w-5 text-right">
                        {entry.rank}
                      </span>
                      <span className="font-semibold truncate max-w-[90px]">
                        {entry.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-emerald-300 font-semibold">
                          {entry.total_points}
                        </div>
                        <div className="text-[0.65rem] text-slate-400">
                          +{entry.week_points} this week
                        </div>
                      </div>
                      <span className={`text-xs ${arrowColor}`}>{arrow}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
