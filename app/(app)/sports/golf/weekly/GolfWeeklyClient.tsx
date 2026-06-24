"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { FaTrophy, FaFlagCheckered, FaGolfBall } from "react-icons/fa";

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
  is_current: boolean | null;
}

interface Player {
  id: number;
  name: string;
  country?: string | null;
  photo_url?: string | null;
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
  const today = new Date();

  // Strict admin control
  const currentTournament = tournaments.find((t) => t.is_current);
  const pastTournaments = tournaments.filter(
    (t) => new Date(t.end_date) < today
  );
  const upcomingTournament = tournaments.find(
    (t) => new Date(t.start_date) > today
  );

  const [selectedTournamentId, setSelectedTournamentId] = useState<number | null>(
    currentTournament?.id ?? null
  );
  const [pickedPlayerId, setPickedPlayerId] = useState<number | null>(null);
  const [userPicks, setUserPicks] = useState<UserPick[]>([]);
  const [loadingPick, setLoadingPick] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [spotlight, setSpotlight] = useState({
    mostPicked: "Scottie Scheffler",
    sleeper: "Sahith Theegala",
    trending: "Ludvig Åberg",
    watch: "Xander Schauffele",
  });
  const [streaks, setStreaks] = useState<Streaks | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [badgeModalOpen, setBadgeModalOpen] = useState(false);
  const [newBadge, setNewBadge] = useState<Badge | null>(null);
  const [topFive, setTopFive] = useState<any[]>([]);

  const isPastTournament = !!(
    selectedTournamentId &&
    pastTournaments.some((t) => t.id === selectedTournamentId)
  );

  // Compute the user's current pick for the active tournament
  const currentPick = (() => {
    if (!currentTournament) return null;

    const pick = userPicks.find(
      (p) => p.tournament_id === currentTournament.id
    );

    if (!pick) return null;

    const player = players.find((pl) => pl.id === pick.player_id);
    return player?.name ?? null;
  })();

  // ----------------------
  // Fetches
  // ----------------------
  useEffect(() => {
    fetch("/api/golf/weekly/state")
      .then((res) => res.json())
      .then((data) => {
        setUserPicks(data.picks || []);
        if (selectedTournamentId) {
          const existing = (data.picks || []).find(
            (p: UserPick) => p.tournament_id === selectedTournamentId
          );
          setPickedPlayerId(existing?.player_id ?? null);
        }
        setLeaderboard(data.leaderboard || []);
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

  useEffect(() => {
    fetch("/api/golf/weekly/spotlight")
      .then((res) => res.json())
      .then((data) => setSpotlight(data.spotlight))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/golf/weekly/streaks")
      .then((r) => r.json())
      .then((d) => setStreaks(d.streaks || null))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/golf/weekly/badges")
      .then((r) => r.json())
      .then((d) => setBadges(d.badges || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/golf/weekly/achievements")
      .then((r) => r.json())
      .then((d) => setAchievements(d.achievements || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!newBadge) return;
    const t = setTimeout(() => setNewBadge(null), 3000);
    return () => clearTimeout(t);
  }, [newBadge]);

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        const res = await fetch("/api/scoreboard/GOLF", { cache: "no-store" });
        const data = await res.json();

        const competitors =
          data?.events?.[0]?.competitions?.[0]?.competitors || [];

        const leaderboard = competitors
          .map((p: any) => {
            const thruStat = p.statistics?.find(
              (s: any) => s.name === "thru"
            );
            return {
              id: p.id,
              athlete: p.athlete,
              score: Number(p.score),
              thru: thruStat?.value ?? "-",
            };
          })
          .sort((a: any, b: any) => a.score - b.score);

        setTopFive(leaderboard.slice(0, 5));
      } catch (err) {
        console.error("Failed to load golf leaderboard:", err);
        setTopFive([]);
      }
    }

    loadLeaderboard();
  }, []);

  // ----------------------
  // Label + Color + Icon helpers
  // ----------------------
  const premiumLabel = (t: Tournament) => {
  if (!t.category) return null;
  switch (t.category) {
    case "major":
      return "Major";
    case "signature":
      return "Signature";
    case "fedex":
      return "FedEx Cup";
    default:
      return null;
  }
};


  const categoryColor = (category: string | null) => {
    switch (category) {
      case "major":
        return "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40";
      case "fedex":
        return "bg-violet-500/10 text-violet-300 border border-violet-500/40";
      case "signature":
        return "bg-yellow-500/10 text-yellow-300 border border-yellow-500/40";
      default:
        return "bg-yellow-500/10 text-yellow-300 border border-yellow-500/40";
    }
  };

  const categoryIcon = (category: string | null) => {
    switch (category) {
      case "major":
        return <FaTrophy className="text-emerald-300 text-xs" />;
      case "fedex":
        return <FaFlagCheckered className="text-violet-300 text-xs" />;
      default:
        return <FaGolfBall className="text-yellow-300 text-xs" />;
    }
  };

  // ----------------------
  // Handle Pick
  // ----------------------
  const handlePick = async () => {
    if (!selectedTournamentId || !pickedPlayerId) return;

    try {
      setLoadingPick(true);

      const res = await fetch("/api/golf/weekly/pick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournament_id: selectedTournamentId,
          player_id: pickedPlayerId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setToast(data.error || "Failed to save pick");
        return;
      }

      // Update user picks
      setUserPicks((prev) => {
        const existing = prev.find(
          (p) => p.tournament_id === selectedTournamentId
        );

        if (existing) {
          return prev.map((p) =>
            p.tournament_id === selectedTournamentId
              ? { ...p, player_id: pickedPlayerId }
              : p
          );
        }

        return [
          ...prev,
          {
            tournament_id: selectedTournamentId,
            player_id: pickedPlayerId,
          },
        ];
      });

      // Confetti celebration
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
      });

      // Toast
      setToast("Pick saved!");

      // Refresh leaderboard
      fetch("/api/golf/weekly/state")
        .then((r) => r.json())
        .then((d) => setLeaderboard(d.leaderboard || []));

      // Refresh streaks
      fetch("/api/golf/weekly/streaks")
        .then((r) => r.json())
        .then((d) => setStreaks(d.streaks || null));

      // Refresh badges
      fetch("/api/golf/weekly/badges")
        .then((r) => r.json())
        .then((d) => {
          setBadges(d.badges || []);

          const newlyEarned = (d.badges || []).find(
            (b: Badge) => b.earned && !badges.find((x) => x.id === b.id)
          );

          if (newlyEarned) {
            setNewBadge(newlyEarned);
          }
        });
    } catch (err) {
      setToast("Error saving pick");
    } finally {
      setLoadingPick(false);
    }
  };

  // ----------------------
  // Render
  // ----------------------
  return (
    <div className="relative w-full min-h-screen bg-slate-950 text-white px-4 py-6 md:px-8 md:py-10 flex flex-col gap-8 overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-slate-900 via-slate-950 to-black opacity-80" />
      <div className="pointer-events-none fixed inset-0 -z-10 animate-pulse-slow opacity-10 bg-[url('/noise.png')]" />

      {/* Sticky Header */}
      {currentTournament && (
        <div className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-white/10 py-2.5 px-4 flex items-center justify-between">
          {/* Tournament Name */}
          <div className="text-lg md:text-xl font-bold text-white tracking-tight">
            {currentTournament.name}
          </div>

          {/* Current Pick */}
          {pickedPlayerId && (
            <div className="text-emerald-400 text-sm md:text-base font-semibold">
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
            Pick one player per tournament. You can pick any player you like
            each week.
          </p>

          <button
            onClick={() => setHistoryOpen(true)}
            className="text-slate-400 hover:text-white text-sm underline"
          >
            View Pick History
          </button>
        </div>
      </header>

      {/* Spotlight + Upcoming Event */}
      <section className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
        {/* Spotlight */}
        <div className="rounded-xl bg-slate-900/70 border border-white/10 p-5 shadow-xl flex flex-col gap-4">
          <h3 className="text-lg font-semibold">Weekly Spotlight</h3>

          <div className="flex flex-col gap-3 text-sm">
            <div>
              <span className="text-slate-400">Most Picked:</span>{" "}
              <span className="text-white font-medium">
                {spotlight.mostPicked}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Sleeper Pick:</span>{" "}
              <span className="text-white font-medium">
                {spotlight.sleeper}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Trending:</span>{" "}
              <span className="text-white font-medium">
                {spotlight.trending}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Player to Watch:</span>{" "}
              <span className="text-white font-medium">
                {spotlight.watch}
              </span>
            </div>
          </div>

          {/* Badge Row */}
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

        {/* Upcoming Event */}
        <div className="rounded-xl bg-slate-900/70 border border-white/10 p-5 shadow-xl flex flex-col gap-4">
          <h3 className="text-lg font-semibold">Upcoming Event</h3>

          {upcomingTournament ? (
            <>
              {/* Tournament name + category pill */}
              <div className="flex items-center gap-3">
                <div className="text-white font-medium text-lg">
                  {upcomingTournament.name}
                </div>

                {premiumLabel(upcomingTournament) && (
                  <span
                    className={`
                      inline-flex items-center gap-1
                      px-2.5 py-1
                      h-6
                      text-[11px] font-semibold uppercase tracking-wide
                      rounded-full
                      ${categoryColor(upcomingTournament.category)}
                    `}
                  >
                    {categoryIcon(upcomingTournament.category)}
                    {premiumLabel(upcomingTournament)}
                  </span>
                )}
              </div>

              {/* Dates */}
              <div className="text-slate-400 text-sm">
                {new Date(
                  upcomingTournament.start_date
                ).toLocaleDateString()}{" "}
                –{" "}
                {new Date(
                  upcomingTournament.end_date
                ).toLocaleDateString()}
              </div>

              {/* Countdown */}
              <p className="text-slate-300 text-sm mt-2">
                Starts in{" "}
                {Math.ceil(
                  (new Date(
                    upcomingTournament.start_date
                  ).getTime() -
                    today.getTime()) /
                    (1000 * 60 * 60 * 24)
                )}{" "}
                days.
              </p>
            </>
          ) : (
            <p className="text-slate-500 text-sm">
              No upcoming tournaments scheduled.
            </p>
          )}
        </div>
      </section>

      {/* Past Tournament Dropdown (disabled) */}
      <div className="mb-6">
      <select
  onChange={(e) => setSelectedTournamentId(Number(e.target.value))}
  className="w-full rounded-lg bg-slate-900/60 border border-white/10 text-slate-300 text-sm p-2"
>
  <option>Past Tournaments</option>
  {pastTournaments.map((t) => (
    <option key={t.id} value={t.id}>
      {t.name} • {new Date(t.start_date).toLocaleDateString()}
    </option>
  ))}
</select>


      {/* CURRENT TOURNAMENT BLOCK */}
      <section className="rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 border border-white/10 p-5 md:p-6 shadow-xl flex flex-col gap-6 animate-fadeIn">
        {/* 1️⃣ Tournament Info + Lock Message */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              {currentTournament?.name ?? "No current tournament"}
            </h2>

            {/* ⭐ Category Pill (Major, Signature, FedEx, etc.) */}
            {currentTournament && premiumLabel(currentTournament) && (
              <span
                className={`
                  inline-flex items-center gap-1
                  px-2.5 py-1
                  h-6
                  text-[11px] font-semibold uppercase tracking-wide
                  rounded-full
                  ${categoryColor(currentTournament.category)}
                `}
              >
                {categoryIcon(currentTournament.category)}
                {premiumLabel(currentTournament)}
              </span>
            )}
          </div>

          {currentTournament && (
            <p className="text-slate-400 text-sm">
              {new Date(
                currentTournament.start_date
              ).toLocaleDateString()}{" "}
              –{" "}
              {new Date(
                currentTournament.end_date
              ).toLocaleDateString()}
            </p>
          )}

          {currentTournament ? (
            <p className="text-slate-300 text-sm">
              Lock in your pick for this event. You can choose any
              player you like this week.
            </p>
          ) : (
            <p className="text-slate-500 text-sm">
              No current tournament available.
            </p>
          )}
        </div>

        {/* 2️⃣ Your Pick This Week */}
        <div className="rounded-lg bg-slate-800/50 border border-white/10 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-1">
              Your Pick This Week
            </h3>
            <p className="text-emerald-400 font-medium">
              {currentPick ?? "No pick locked in yet."}
            </p>
          </div>

          <Link
            href="/sports/golf/scoreboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30 transition"
          >
            View Full Golf Scoreboard
          </Link>
        </div>

        {/* 3️⃣ Scoreboard Block */}
        {topFive?.length > 0 ? (
          <div className="rounded-lg bg-slate-800/40 border border-white/10 p-4 shadow-inner">
            <h4 className="text-sm font-semibold text-slate-300 mb-3">
              Top 5 Leaderboard
            </h4>

            <div className="space-y-3">
              {topFive.map((p: any, idx: number) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 text-xs w-4">
                      {idx + 1}
                    </span>
                    {p.athlete?.headshot && (
                      <img
                        src={p.athlete.headshot}
                        alt={p.athlete.shortName}
                        className="w-7 h-7 rounded-full"
                      />
                    )}
                    <span className="text-slate-200 text-sm">
                      {p.athlete?.shortName ?? "Unknown"}
                    </span>
                  </div>

                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        p.score < 0
                          ? "text-emerald-400"
                          : p.score > 0
                          ? "text-red-400"
                          : "text-slate-300"
                      }`}
                    >
                      {p.score}
                    </p>
                    <p className="text-xs text-slate-500">
                      Thru {p.thru || "-"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-lg bg-slate-800/40 border border-white/10 p-4 text-slate-500 text-sm">
            No leaderboard data available.
          </div>
        )}
      </section>

      {/* Player Selection Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-6">
        {players.map((pl) => (
          <button
            key={pl.id}
            onClick={() => setPickedPlayerId(pl.id)}
            className={`p-3 rounded-lg border text-left transition ${
              pickedPlayerId === pl.id
                ? "bg-emerald-600/20 border-emerald-500 text-emerald-300"
                : "bg-slate-800/40 border-white/10 text-slate-300 hover:border-emerald-400"
            }`}
          >
            <div className="flex items-center gap-2">
              {pl.photo_url && (
                <img
                  src={pl.photo_url}
                  alt={pl.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
              <span className="font-medium text-sm">
                {pl.name}
              </span>
            </div>
            {pl.country && (
              <p className="text-xs text-slate-500 mt-1">
                {pl.country}
              </p>
            )}
          </button>
        ))}
      </div>

      {/* Save Button */}
      <button
        onClick={handlePick}
        disabled={isPastTournament || !pickedPlayerId || loadingPick}
        className={`
          w-full py-3 rounded-lg text-center font-semibold text-sm mt-4
          transition-all duration-200
          ${
            isPastTournament
              ? "bg-slate-800 text-slate-500 cursor-not-allowed"
              : pickedPlayerId
              ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30"
              : "bg-slate-800 text-slate-500 cursor-not-allowed"
          }
        `}
      >
        {isPastTournament
          ? "Cannot pick for past tournaments"
          : loadingPick
          ? "Saving..."
          : "Save Pick"}
      </button>

      {/* Player Picks Sidebar */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-slate-900/80 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full text-sm text-slate-300 hover:text-white shadow-lg"
      >
        Player Picks
      </button>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />

          <div className="w-80 bg-slate-900 border-l border-white/10 p-5 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              Player Picks
            </h3>

            {userPicks.length === 0 && (
              <p className="text-sm text-slate-500">
                No picks yet.
              </p>
            )}

            <div className="flex flex-col gap-3">
              {userPicks.map((p) => {
                const t = tournaments.find(
                  (t) => t.id === p.tournament_id
                );
                const pl = players.find(
                  (pl) => pl.id === p.player_id
                );

                return (
                  <div
                    key={`${p.tournament_id}-${p.player_id}`}
                    className="p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="text-white font-medium text-sm">
                      {pl?.name}
                    </div>
                    <div className="text-xs text-slate-400">
                      {t?.name}
                    </div>
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
              <h3 className="text-xl font-semibold">
                Pick History
              </h3>
              <button
                onClick={() => setHistoryOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {userPicks.length === 0 && (
              <p className="text-sm text-slate-500">
                No picks yet.
              </p>
            )}

            <div className="flex flex-col gap-3">
              {userPicks.map((p) => {
                const t = tournaments.find(
                  (t) => t.id === p.tournament_id
                );
                const pl = players.find(
                  (pl) => pl.id === p.player_id
                );

                return (
                  <div
                    key={`${p.tournament_id}-${p.player_id}`}
                    className="p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="text-white font-medium text-sm">
                      {pl?.name}
                    </div>
                    <div className="text-xs text-slate-400">
                      {t?.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Badge Collection Modal */}
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

                  <div className="text-2xl mb-2">
                    {b.emoji}
                  </div>

                  <div className="text-sm font-semibold text-white">
                    {b.name}
                  </div>

                  <div className="text-xs text-slate-400 mt-1">
                    {b.description}
                  </div>

                  {b.earned_at && (
                    <div className="text-[10px] text-emerald-300 mt-2">
                      Earned{" "}
                      {new Date(
                        b.earned_at
                      ).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* New Badge Toast */}
      {newBadge && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
          <div className="px-4 py-3 rounded-xl bg-slate-900/95 border border-emerald-400/60 shadow-xl flex items-center gap-3 animate-fadeIn">
            <span className="text-2xl">
              {newBadge.emoji}
            </span>
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

      {/* Save Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="px-4 py-2 rounded-lg bg-slate-900/90 border border-white/10 shadow-xl text-sm text-white animate-fadeIn">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
