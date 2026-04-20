"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

// ----------------------
// Types
// ----------------------
interface Tournament {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  category: string | null;
  is_premium_event: boolean | null;
}

interface Player {
  id: number;
  name: string;
}

interface UserPick {
  tournament_id: number;
  player_id: number;
}

interface LeaderboardRow {
  user_id: number;
  name: string;
  initials: string;
  points: number;
}

// ---- DROP 3 TYPES ----
interface Streaks {
  current_streak: number;
  longest_streak: number;
  perfect_season: boolean;
  major_streak: number;
}

interface Badge {
  id: string;
  emoji: string;
  name: string;
  description: string;
  earned: boolean;
  earned_at: string | null;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  target: number;
  progress: number;
  completed: boolean;
}

// ----------------------
// COMPONENT
// ----------------------
export default function GolfWeeklyClient({
  tournaments,
  players,
}: {
  tournaments: Tournament[];
  players: Player[];
}) {

  // ----------------------
  // PHASE 1 + 2 STATE
  // ----------------------
  const [selectedTournamentId, setSelectedTournamentId] = useState<number | null>(
    tournaments[0]?.id ?? null
  );
  const [pickedPlayerId, setPickedPlayerId] = useState<number | null>(null);
  const [userPicks, setUserPicks] = useState<UserPick[]>([]);
  const [loadingPick, setLoadingPick] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);

  // Spotlight (Drop 2)
  const [spotlight, setSpotlight] = useState({
    mostPicked: "Scottie Scheffler",
    sleeper: "Sahith Theegala",
    trending: "Ludvig Åberg",
    watch: "Xander Schauffele",
  });

  // ----------------------
  // DROP 3 STATE
  // ----------------------
  const [streaks, setStreaks] = useState<Streaks | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [badgeModalOpen, setBadgeModalOpen] = useState(false);
  const [newBadge, setNewBadge] = useState<Badge | null>(null);

  // ----------------------
  // INITIAL FETCHES
  // ----------------------
  useEffect(() => {
    fetch("/sports/golf/weekly/state")
      .then((res) => res.json())
      .then((data) => {
        setUserPicks(data.picks || []);
        if (selectedTournamentId) {
          const existing = (data.picks || []).find(
            (p: UserPick) => p.tournament_id === selectedTournamentId
          );
          setPickedPlayerId(existing?.player_id ?? null);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedTournamentId) return;
    const existing = userPicks.find(
      (p) => p.tournament_id === selectedTournamentId
    );
    setPickedPlayerId(existing?.player_id ?? null);
  }, [selectedTournamentId, userPicks]);

  // Toast auto-hide
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  // Leaderboard fetch
  useEffect(() => {
    fetch("/sports/golf/weekly/leaderboard")
      .then((res) => res.json())
      .then((data) => setLeaderboard(data.leaderboard || []))
      .catch(() => {});
  }, []);

  // ----------------------
  // SPOTLIGHT LOGIC (Drop 2)
  // ----------------------
  useEffect(() => {
    if (userPicks.length < 5) {
      setSpotlight({
        mostPicked: "Scottie Scheffler",
        sleeper: "Sahith Theegala",
        trending: "Ludvig Åberg",
        watch: "Xander Schauffele",
      });
      return;
    }

    const counts: Record<number, number> = {};
    userPicks.forEach((p) => {
      counts[p.player_id] = (counts[p.player_id] || 0) + 1;
    });

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const mostPickedId = Number(sorted[0]?.[0]);
    const mostPickedName =
      players.find((p) => p.id === mostPickedId)?.name || "Scottie Scheffler";

    const top20 = players.slice(0, 20);
    const sleeper = top20.reduce(
      (acc, p) =>
        (counts[p.id] || 0) < (counts[acc.id] || 0) ? p : acc,
      top20[0]
    );

    const trending =
      players[Math.floor(Math.random() * players.length)]?.name ||
      "Ludvig Åberg";

    setSpotlight({
      mostPicked: mostPickedName,
      sleeper: sleeper.name,
      trending,
      watch: "Xander Schauffele",
    });
  }, [userPicks, players]);

  // ----------------------
  // DROP 3 FETCHES
  // ----------------------
  useEffect(() => {
    fetch("/sports/golf/weekly/streaks")
      .then((r) => r.json())
      .then((d) => setStreaks(d.streaks || null))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/sports/golf/weekly/badges")
      .then((r) => r.json())
      .then((d) => setBadges(d.badges || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/sports/golf/weekly/achievements")
      .then((r) => r.json())
      .then((d) => setAchievements(d.achievements || []))
      .catch(() => {});
  }, []);

  // Auto-hide new badge popup
  useEffect(() => {
    if (!newBadge) return;
    const t = setTimeout(() => setNewBadge(null), 3000);
    return () => clearTimeout(t);
  }, [newBadge]);

  // ----------------------
  // PICK HANDLER (DROP 3)
  // ----------------------
  const handlePick = async () => {
    if (!selectedTournamentId || !pickedPlayerId) return;

    setLoadingPick(true);
    try {
      const res = await fetch("/sports/golf/weekly/pick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournament_id: selectedTournamentId,
          player_id: pickedPlayerId,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        alert(json.error || "Error saving pick");
        return;
      }

      // Update local picks
      setUserPicks((prev) => [
        ...prev.filter((p) => p.tournament_id !== selectedTournamentId),
        { tournament_id: selectedTournamentId, player_id: pickedPlayerId },
      ]);

      // --- STREAK COMPUTATION ---
      const sortedTournaments = [...tournaments].sort(
        (a, b) =>
          new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      );

      const pickedSet = new Set(
        [...userPicks, { tournament_id: selectedTournamentId, player_id: pickedPlayerId }].map(
          (p) => p.tournament_id
        )
      );

      let current = 0;
      for (const t of sortedTournaments) {
        if (pickedSet.has(t.id)) current++;
        else break;
      }

      const longest = Math.max(current, streaks?.longest_streak ?? 0);
      const perfectSeason = sortedTournaments.every((t) =>
        pickedSet.has(t.id)
      );
      const majorStreak = sortedTournaments
        .filter((t) => t.category === "major")
        .every((t) => pickedSet.has(t.id))
        ? (streaks?.major_streak ?? 0) + 1
        : streaks?.major_streak ?? 0;

      const newStreaks: Streaks = {
        current_streak: current,
        longest_streak: longest,
        perfect_season: perfectSeason,
        major_streak: majorStreak,
      };

      setStreaks(newStreaks);

      // Persist streaks
      fetch("/sports/golf/weekly/streaks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStreaks),
      }).catch(() => {});

      // --- BADGE LOGIC ---
      const toAward: string[] = [];
      if (current >= 3) toAward.push("on_a_roll");
      if (current >= 5) toAward.push("hot_hand");
      if (current >= 10) toAward.push("ironman");
      if (perfectSeason) toAward.push("perfect_season");
      if (userPicks.length === 0) toAward.push("opening_drive");

      const newlyEarned: Badge[] = [];

      toAward.forEach((id) => {
        const already = badges.find((b) => b.id === id && b.earned);
        if (!already) {
          fetch("/sports/golf/weekly/badges", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ badge_id: id }),
          }).catch(() => {});

          const meta = badges.find((b) => b.id === id);
          if (meta) {
            newlyEarned.push({
              ...meta,
              earned: true,
              earned_at: new Date().toISOString(),
            });
          }
        }
      });

      // Badge unlock animation
      if (newlyEarned.length > 0) {
        setBadges((prev) =>
          prev.map((b) => newlyEarned.find((n) => n.id === b.id) ?? b)
        );
        setNewBadge(newlyEarned[0]);
        setToast(`New badge earned: ${newlyEarned[0].name}`);
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      } else {
        setToast("Pick saved!");
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
      }
    } finally {
      setLoadingPick(false);
    }
  };

  // ----------------------
  // RENDER
  // ----------------------

  const pickedPlayerIds = new Set(userPicks.map((p) => p.player_id));
  const currentTournament = tournaments.find(
    (t) => t.id === selectedTournamentId
  );

  const premiumLabel = (t: Tournament) => {
    if (!t.is_premium_event) return null;
    if (t.category === "major") return "Major";
    if (t.category === "signature") return "Signature";
    if (t.category === "fedex") return "FedEx Cup";
    return "Premium";
  };

  const totalWeeks = tournaments.length;
  const weeksPicked = userPicks.length;

  return (
    <div className="relative w-full min-h-screen bg-slate-950 text-white px-4 py-6 md:px-8 md:py-10 flex flex-col gap-8">

      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-slate-900 via-slate-950 to-black opacity-80" />
      <div className="pointer-events-none fixed inset-0 -z-10 animate-pulse-slow opacity-10 bg-[url('/noise.png')]" />

      {/* Sticky Header */}
      {currentTournament && (
        <div className="
          sticky top-0 z-40
          bg-slate-950/80 backdrop-blur-xl
          border-b border-white/10
          py-3 px-2 flex items-center justify-between
        ">
          <div className="font-semibold text-white text-sm">
            {currentTournament.name}
          </div>

          {pickedPlayerId && (
            <div className="text-emerald-400 text-xs">
              Picked: {players.find((p) => p.id === pickedPlayerId)?.name}
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fadeIn">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Golf Weekly Picks
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-xl">
            Pick one player per tournament. You can only pick each player once
            per season.
          </p>

          <button
            onClick={() => setHistoryOpen(true)}
            className="text-slate-400 hover:text-white text-sm underline"
          >
            View Pick History
          </button>
        </div>

        {/* Progress */}
        <div className="flex flex-col items-start md:items-end gap-1">
          <span className="text-xs uppercase tracking-wide text-slate-400">
            Season Progress
          </span>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-emerald-400">
              {weeksPicked} / {totalWeeks}
            </span>
            <span className="text-slate-500">weeks picked</span>
          </div>
          <div className="w-40 h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{
                width: `${Math.min(
                  100,
                  totalWeeks ? (weeksPicked / totalWeeks) * 100 : 0
                )}%`,
              }}
            />
          </div>
        </div>
      </header>

      {/* ---- DROP 3 STREAK CARD ---- */}
      {streaks && (
        <section className="animate-fadeIn">
          <div className="rounded-xl bg-slate-900/70 border border-emerald-500/40 p-4 shadow-lg flex items-center justify-between">
            <div>
              <div className="text-xs text-emerald-300 uppercase tracking-wide">
                Current Streak
              </div>
              <div className="text-lg font-semibold text-white">
                {streaks.current_streak} week
                {streaks.current_streak === 1 ? "" : "s"}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Longest</div>
              <div className="text-sm text-slate-100">
                {streaks.longest_streak} weeks
              </div>
              {streaks.perfect_season && (
                <div className="mt-1 text-xs text-yellow-300">
                  🌟 Perfect season (so far)
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Tournament Selector */}
      <section className="space-y-3 animate-fadeIn">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
            Tournaments
          </h2>
          <span className="text-xs text-slate-500">
            Scroll to view all events
          </span>
        </div>

        <div className="w-full overflow-x-auto no-scrollbar py-1">
          <div className="flex gap-3 min-w-max">
            {tournaments.map((t) => {
              const isSelected = selectedTournamentId === t.id;
              const label = premiumLabel(t);

              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTournamentId(t.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-full text-xs md:text-sm font-medium
                    transition-all duration-200
                    ${
                      isSelected
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                        : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700/60"
                    }
                  `}
                >
                  <span className="whitespace-nowrap">{t.name}</span>
                  {label && (
                    <span className="text-[9px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-300 border border-yellow-500/30">
                      {label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Spotlight + Hero + Leaderboard */}
      <section className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">

        {/* Spotlight */}
        <div className="lg:col-span-1">
          <div className="rounded-xl bg-slate-900/70 border border-white/10 p-5 shadow-xl flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Weekly Spotlight</h3>

            <div className="flex flex-col gap-3 text-sm">
              <div>
                <span className="text-slate-400">Most Picked:</span>{" "}
                <span className="text-white font-medium">{spotlight.mostPicked}</span>
              </div>
              <div>
                <span className="text-slate-400">Sleeper Pick:</span>{" "}
                <span className="text-white font-medium">{spotlight.sleeper}</span>
              </div>
              <div>
                <span className="text-slate-400">Trending:</span>{" "}
                <span className="text-white font-medium">{spotlight.trending}</span>
              </div>
              <div>
                <span className="text-slate-400">Player to Watch:</span>{" "}
                <span className="text-white font-medium">{spotlight.watch}</span>
              </div>
            </div>

            {/* ---- BADGE ROW ---- */}
            <div className="flex flex-wrap gap-2 mt-3">
              {badges
                .filter((b) => b.earned)
                .slice(0, 4)
                .map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setBadgeModalOpen(true)}
                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/15 shadow-sm flex items-center gap-2 text-xs hover:border-emerald-400 transition"
                  >
                    <span className="text-base">{b.emoji}</span>
                    <span className="text-slate-100">{b.name}</span>
                  </button>
                ))}

              {badges.filter((b) => b.earned).length === 0 && (
                <span className="text-xs text-slate-500">
                  Earn badges by building streaks and hitting milestones.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Hero */}
        {currentTournament && (
          <div className="lg:col-span-2">
            <div className="w-full bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-5 md:p-6 shadow-xl border border-white/10 flex flex-col gap-4">
              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  {currentTournament.name}
                </h2>
                <p className="text-slate-400 text-sm">
                  {new Date(currentTournament.start_date).toLocaleDateString()} –{" "}
                  {new Date(currentTournament.end_date).toLocaleDateString()}
                </p>
                {premiumLabel(currentTournament) && (
                  <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 text-[11px] uppercase tracking-wide rounded-full bg-yellow-500/10 text-yellow-300 border border-yellow-500/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                    {premiumLabel(currentTournament)}
                  </span>
                )}
              </div>
              <p className="text-slate-300 text-sm">
                Lock in your pick for this event. You can&apos;t reuse this player later in the season.
              </p>
            </div>
          </div>
        )}

      </section>

        {/* Leaderboard */}
        <div className="lg:col-span-3">
          <div className="rounded-xl bg-slate-900/70 border border-white/10 p-5 shadow-xl flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Leaderboard</h3>

            {leaderboard.length === 0 && (
              <div className="text-sm text-slate-500">
                Leaderboard will update once scoring begins.
              </div>
            )}

            {leaderboard.length > 0 && (
              <div className="flex flex-col gap-3">
                {leaderboard.map((row, index) => (
                  <div
                    key={row.user_id}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold text-white">
                        {row.initials}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white font-medium">
                          {row.name}
                        </span>
                        <span className="text-xs text-slate-400">
                          Rank #{index + 1}
                        </span>
                      </div>
                    </div>

                    <div className="text-emerald-400 font-semibold">
                      {row.points} pts
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      {/* ---- ACHIEVEMENTS SECTION ---- */}
      <section className="w-full animate-fadeIn">
        <div className="rounded-xl bg-slate-900/80 border border-white/10 p-5 shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Achievements</h3>
            <span className="text-xs text-slate-500">Season progress</span>
          </div>

          <div className="flex flex-col gap-3">
            {achievements.length === 0 && (
              <div className="text-sm text-slate-500">
                Achievements will appear as you play the season.
              </div>
            )}

            {achievements.map((a) => {
              const pct = a.target
                ? Math.min(100, (a.progress / a.target) * 100)
                : 0;

              return (
                <div key={a.id} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-100">{a.name}</span>
                    <span className="text-xs text-slate-400">
                      {a.progress}/{a.target}
                    </span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full ${
                        a.completed ? "bg-emerald-400" : "bg-emerald-600"
                      } transition-all duration-300`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="text-xs text-slate-500">
                    {a.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Player Grid */}
      <section className="w-full animate-fadeIn">
        <div className="rounded-xl bg-slate-900/70 border border-white/10 p-5 shadow-xl flex flex-col gap-4">
          <h3 className="text-lg font-semibold">Select Your Player</h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {players.map((player) => {
              const isPicked = pickedPlayerId === player.id;
              const alreadyUsed = pickedPlayerIds.has(player.id);

              return (
                <button
                  key={player.id}
                  disabled={alreadyUsed}
                  onClick={() => setPickedPlayerId(player.id)}
                  className={`
                    p-3 rounded-lg border text-sm text-left transition-all
                    ${
                      alreadyUsed
                        ? "bg-slate-800/40 border-slate-700 text-slate-600 cursor-not-allowed"
                        : isPicked
                        ? "bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/30"
                        : "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"
                    }
                  `}
                >
                  {player.name}
                </button>
              );
            })}
          </div>

          {/* Save Button */}
          <button
            onClick={handlePick}
            disabled={!pickedPlayerId || loadingPick}
            className={`
              w-full py-3 rounded-lg text-center font-semibold text-sm mt-4
              transition-all duration-200
              ${
                pickedPlayerId
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }
            `}
          >
            {loadingPick ? "Saving..." : "Save Pick"}
          </button>
        </div>
      </section>

      {/* Used Players Sidebar */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-slate-900/80 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full text-sm text-slate-300 hover:text-white shadow-lg"
      >
        Used Players
      </button>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />

          <div className="w-80 bg-slate-900 border-l border-white/10 p-5 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Used Players</h3>

            {userPicks.length === 0 && (
              <p className="text-sm text-slate-500">No players used yet.</p>
            )}

            <div className="flex flex-col gap-3">
              {userPicks.map((p) => {
                const t = tournaments.find((t) => t.id === p.tournament_id);
                const pl = players.find((pl) => pl.id === p.player_id);

                return (
                  <div
                    key={`${p.tournament_id}-${p.player_id}`}
                    className="p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="text-white font-medium text-sm">
                      {pl?.name}
                    </div>
                    <div className="text-xs text-slate-400">{t?.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Pick History Modal */}
      {historyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xl">
          <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-xl p-6 shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Pick History</h3>
              <button
                onClick={() => setHistoryOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {userPicks.length === 0 && (
              <p className="text-sm text-slate-500">No picks yet.</p>
            )}

            <div className="flex flex-col gap-3">
              {userPicks.map((p) => {
                const t = tournaments.find((t) => t.id === p.tournament_id);
                const pl = players.find((pl) => pl.id === p.player_id);

                return (
                  <div
                    key={`${p.tournament_id}-${p.player_id}`}
                    className="p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="text-white font-medium text-sm">
                      {pl?.name}
                    </div>
                    <div className="text-xs text-slate-400">{t?.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {/* ---- BADGE COLLECTION MODAL ---- */}
      {badgeModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 flex items-center justify-center">
          <div className="w-full max-w-2xl bg-slate-900/90 border border-white/10 rounded-xl p-6 shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Badges</h3>
              <button
                onClick={() => setBadgeModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {badges.map((b) => (
                <div
                  key={b.id}
                  className={`
                    relative p-4 rounded-xl border shadow-md
                    bg-white/5
                    ${
                      b.earned
                        ? "border-emerald-400/60 shadow-emerald-500/20"
                        : "border-white/10 opacity-60"
                    }
                  `}
                >
                  {!b.earned && (
                    <div className="absolute inset-0 rounded-xl bg-slate-950/60 flex items-center justify-center text-xs text-slate-400">
                      🔒 Locked
                    </div>
                  )}

                  <div className="text-2xl mb-2">{b.emoji}</div>

                  <div className="text-sm font-semibold text-white">
                    {b.name}
                  </div>

                  <div className="text-xs text-slate-400 mt-1">
                    {b.description}
                  </div>

                  {b.earned_at && (
                    <div className="text-[10px] text-emerald-300 mt-2">
                      Earned {new Date(b.earned_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---- NEW BADGE TOAST ---- */}
      {newBadge && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
          <div className="px-4 py-3 rounded-xl bg-slate-900/95 border border-emerald-400/60 shadow-xl flex items-center gap-3 animate-fadeIn">
            <span className="text-2xl">{newBadge.emoji}</span>
            <div className="flex flex-col">
              <span className="text-xs text-emerald-300 uppercase tracking-wide">
                New Badge Unlocked
              </span>
              <span className="text-sm text-white font-semibold">
                {newBadge.name}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ---- TOAST ---- */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="px-4 py-2 rounded-lg bg-slate-900/90 border border-white/10 shadow-xl text-sm text-white animate-fadeIn">
            {toast}
          </div>
        </div>
      )}
    </div>
    {/* end main wrapper */}
  );
}
