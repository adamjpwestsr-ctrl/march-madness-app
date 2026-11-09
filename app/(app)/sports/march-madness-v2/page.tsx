
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Forum from "@/app/components/march-madness/Forum";
import CollegeSportsTicker from "@/app/components/march-madness/CollegeSportsTicker";
import BracketBossHelper from "@/components/march-madness/BracketBossHelper";

type LeaderboardRow = {
  bracket_id: string;
  user_id: number | null;
  total_points: number | null;
  bracket_name?: string;
  display_name?: string;
  champion_pick?: string | null;
  max_possible_points?: number | null;
  scoring_status?: "scored" | "pending";
  rank?: number | null;
  has_paid?: boolean | null;
};

type UserBracket = {
  id: string;
  bracket_id: string;
  name: string;
  status: string;
  created_at?: string;
};

type ChampionPick = {
  team_id: string;
  team_name: string;
  count: number;
  percentage: number;
};

export default function MarchMadnessHubPage() {
  const router = useRouter();

  const [isClient, setIsClient] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [userBrackets, setUserBrackets] = useState<UserBracket[]>([]);
  const [topChampionPicks, setTopChampionPicks] = useState<ChampionPick[]>([]);

  const [championPicksLocked, setChampionPicksLocked] = useState(true);
  const [lockTime, setLockTime] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteCopied, setInviteCopied] = useState(false);

  function handleLogout() {
    localStorage.removeItem("bracketUser");
    router.push("/sports/march-madness-v2/login");
  }

  // --------------------------------------------------
  // INVITE FRIENDS
  // --------------------------------------------------

  async function handleInvite() {
    const inviteUrl = `${window.location.origin}/sports/march-madness-v2`;

    try {
      await navigator.clipboard.writeText(inviteUrl);
      setInviteCopied(true);
    } catch (err) {
      console.error("Unable to copy invite link:", err);
      setError(
        "Unable to copy the invite link. Please copy this address manually: " +
          inviteUrl
      );
    }
  }

  useEffect(() => {
    setIsClient(true);
  }, []);

  // --------------------------------------------------
  // AUTHENTICATION
  // --------------------------------------------------

  useEffect(() => {
    if (!isClient) return;

    const stored = localStorage.getItem("bracketUser");

    if (!stored) {
      setAuthChecked(true);
      router.push("/sports/march-madness-v2/login");
      return;
    }

    try {
      const parsed = JSON.parse(stored);

      if (!parsed?.email) {
        setAuthChecked(true);
        router.push("/sports/march-madness-v2/login");
        return;
      }

      setCurrentUser(parsed);
    } catch {
      setAuthChecked(true);
      router.push("/sports/march-madness-v2/login");
      return;
    }

    setAuthChecked(true);
  }, [isClient, router]);

  // --------------------------------------------------
  // LOAD LEADERBOARD
  // --------------------------------------------------

  async function refreshLeaderboard() {
    if (!currentUser?.user_id) return;

    const response = await fetch(
      `/api/march-madness-v2/leaderboard?viewer_user_id=${encodeURIComponent(
        String(currentUser.user_id)
      )}`,
      { cache: "no-store" }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error ?? "Failed to refresh leaderboard.");
    }

    setLeaderboard(data.leaderboard ?? []);

    setChampionPicksLocked(
      data.championPicksLocked !== false
    );

    setTopChampionPicks(
      data.championPicksLocked === false
        ? data.topChampionPicks ?? []
        : []
    );

    setLockTime(data.lockTime ?? null);
  }

  // --------------------------------------------------
  // INITIAL HUB DATA
  // --------------------------------------------------

  useEffect(() => {
    if (!authChecked || !currentUser) return;

    let cancelled = false;

    async function loadAll() {
      setLoading(true);
      setError(null);

      try {
        await refreshLeaderboard();

        const bracketsResponse = await fetch(
          "/api/march-madness-v2/user-brackets",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: currentUser.user_id }),
            cache: "no-store",
          }
        );

        const bracketsJson = await bracketsResponse.json();

        if (!bracketsResponse.ok || !bracketsJson.success) {
          throw new Error(
            bracketsJson.error ?? "Failed to load your bracket entries."
          );
        }

        if (cancelled) return;

        setUserBrackets(bracketsJson.brackets ?? []);
      } catch (err: unknown) {
        if (cancelled) return;

        const message =
          err instanceof Error
            ? err.message
            : "Failed to load Hub data.";

        setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAll();

    return () => {
      cancelled = true;
    };
  }, [authChecked, currentUser]);

  // --------------------------------------------------
  // AUTOMATIC LEADERBOARD REFRESH
  // --------------------------------------------------

  useEffect(() => {
    if (!authChecked || !currentUser?.user_id) return;

    const interval = window.setInterval(async () => {
      try {
        await refreshLeaderboard();
      } catch (err) {
        console.error("Leaderboard refresh error:", err);
      }
    }, 30000);

    return () => window.clearInterval(interval);
  }, [authChecked, currentUser]);

  // --------------------------------------------------
  // PAGE GUARDS
  // --------------------------------------------------

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#080f20] text-white flex items-center justify-center">
        <p className="text-slate-400 text-sm">Loading BracketBoss...</p>
      </div>
    );
  }

  if (!currentUser) return null;

  const firstBracket = userBrackets[0];

  const isCurrentUser = (row: LeaderboardRow) =>
    row.user_id !== null &&
    row.user_id !== undefined &&
    currentUser.user_id !== null &&
    currentUser.user_id !== undefined &&
    String(row.user_id) === String(currentUser.user_id);

  const totalEntries = userBrackets.length;

  const scoredEntries = leaderboard.filter(
    (row) => row.scoring_status !== "pending"
  ).length;

  const formattedLockTime = lockTime
    ? new Date(lockTime).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  return (
    <div className="min-h-screen bg-[#080f20] text-white flex flex-col relative overflow-x-hidden">
      {/* Background lighting */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-48 left-1/4 h-[480px] w-[480px] rounded-full bg-cyan-500/[0.07] blur-[130px]" />
        <div className="absolute top-[38%] -right-48 h-[420px] w-[420px] rounded-full bg-blue-600/[0.07] blur-[130px]" />
        <div className="absolute bottom-0 left-0 h-[360px] w-[360px] rounded-full bg-indigo-600/[0.05] blur-[120px]" />
      </div>

      {/* Compact header */}
      <header className="relative z-10 border-b border-cyan-400/15 bg-[#0a1428]/95 shadow-[0_8px_35px_rgba(0,0,0,0.25)]">
        <div className="mx-auto max-w-[1600px] px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.9)]" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-cyan-300">
                    BracketBoss Intelligence
                  </span>
                </div>

                <h1 className="text-xl font-black tracking-tight text-white sm:text-2xl lg:text-[28px]">
                  Bracket Busters
                  <span className="text-cyan-300"> March Madness</span>
                </h1>

                <div className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">
                  Challenge
                  <span className="mx-2 text-slate-600">•</span>
                  Presented by{" "}
                  <span className="font-bold text-cyan-300">BracketBoss</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() =>
                    router.push("/sports/march-madness-v2/bracket/new")
                  }
                  className="rounded-lg border border-cyan-300/40 bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-[0_5px_18px_rgba(6,182,212,0.2)] transition hover:brightness-110"
                >
                  <span className="mr-1">＋</span>
                  Create Bracket
                </button>

                <button
                  type="button"
                  onClick={handleInvite}
                  className="rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-4 py-2.5 text-xs font-extrabold text-emerald-200 transition hover:border-emerald-300 hover:bg-emerald-400/20"
                >
                  <span className="mr-1">✉</span>
                  {inviteCopied ? "LINK COPIED ✓" : "INVITE FRIENDS"}
                </button>

                {firstBracket ? (
                  <button
                    onClick={() =>
                      router.push(
                        `/sports/march-madness-v2/bracket/edit/${firstBracket.bracket_id}`
                      )
                    }
                    className="rounded-lg border border-slate-600/70 bg-[#14233b] px-4 py-2.5 text-xs font-bold text-slate-200 transition hover:border-cyan-400/50 hover:bg-[#1a304d] hover:text-white"
                  >
                    Edit Bracket
                  </button>
                ) : (
                  <button
                    disabled
                    className="cursor-not-allowed rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2.5 text-xs font-bold text-slate-500"
                  >
                    Edit Bracket
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="rounded-lg border border-slate-700/70 bg-transparent px-3 py-2.5 text-xs font-semibold text-slate-400 transition hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-300"
                >
                  Log Out
                </button>
              </div>
            </div>

            {/* Score ticker intentionally unchanged */}
            <div className="overflow-hidden rounded-lg border border-slate-700/70 bg-[#080f20]/80">
              <CollegeSportsTicker />
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-[1600px] flex-1 px-4 py-4 sm:px-6 lg:px-8">
        {/* Compact bracket entries strip */}
        <section className="mb-4 overflow-hidden rounded-xl border border-cyan-400/20 bg-gradient-to-r from-[#10213a] to-[#0a1426] shadow-[0_8px_25px_rgba(0,0,0,0.16)]">
          <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
                Your Brackets
              </span>

              <span className="rounded-md border border-slate-600/60 bg-slate-900/50 px-2 py-1 text-[10px] font-semibold text-slate-300">
                {totalEntries} {totalEntries === 1 ? "Entry" : "Entries"}
              </span>

              {loading ? (
                <span className="text-xs text-slate-500">
                  Loading entries...
                </span>
              ) : userBrackets.length === 0 ? (
                <span className="text-xs text-slate-400">
                  No brackets created yet.
                </span>
              ) : (
                <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
                  {userBrackets.map((bracket) => (
                    <div
                      key={bracket.id}
                      className="flex min-w-0 items-center gap-2"
                    >
                      <span className="max-w-[150px] truncate text-xs font-bold text-white">
                        {bracket.name}
                      </span>
                      <span className="hidden text-[9px] uppercase text-slate-500 sm:inline">
                        {bracket.status || "In Progress"}
                      </span>
                      <a
                        href={`/sports/march-madness-v2/bracket/view/${bracket.bracket_id}`}
                        className="text-[10px] font-bold text-slate-400 transition hover:text-cyan-200"
                      >
                        View
                      </a>
                      <a
                        href={`/sports/march-madness-v2/bracket/edit/${bracket.bracket_id}`}
                        className="text-[10px] font-bold text-cyan-300 transition hover:text-cyan-100"
                      >
                        Edit
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() =>
                router.push("/sports/march-madness-v2/bracket/new")
              }
              className="shrink-0 self-start rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-[10px] font-bold text-cyan-200 transition hover:bg-cyan-400/20 sm:self-center"
            >
              + New Bracket
            </button>
          </div>
        </section>

        {/* Main dashboard */}
        <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1.75fr)_minmax(320px,0.85fr)]">
          {/* Leaderboard */}
          <section className="min-w-0 overflow-hidden rounded-2xl border border-cyan-400/20 bg-[#0d1a2e]/95 shadow-[0_12px_40px_rgba(0,0,0,0.22)]">
            <div className="flex flex-col justify-between gap-2 border-b border-white/[0.07] bg-gradient-to-r from-[#132b47] to-[#0e1c31] px-4 py-3 sm:flex-row sm:items-center sm:px-5">
              <div>
                <div className="text-[9px] font-bold uppercase tracking-[0.25em] text-cyan-300">
                  The Competition
                </div>
                <h2 className="mt-0.5 text-xl font-black text-white">
                  Leaderboard
                </h2>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  See how your bracket stacks up against the field.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 sm:self-center">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-300">
                  Live Scoring
                </span>
              </div>
            </div>

            {error && (
              <div className="m-4 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-xs text-red-300">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex min-h-[220px] items-center justify-center gap-3 text-sm text-slate-400">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-300" />
                Loading leaderboard...
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-800/70 text-xl">
                  🏀
                </div>
                <p className="font-bold text-white">
                  The leaderboard is ready.
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Scores will appear here once brackets are submitted.
                </p>
              </div>
            ) : (
              <>
                {/* MOBILE / TABLET LEADERBOARD CARDS */}
                <div className="space-y-3 p-3 lg:hidden">
                  {leaderboard.map((row, index) => {
                    const mine = isCurrentUser(row);
                    const pending = row.scoring_status === "pending";
                    const rank = row.rank ?? index + 1;

                    return (
                      <article
                        key={`mobile-${row.bracket_id}-${index}`}
                        className={`rounded-xl border p-3 ${
                          mine
                            ? "border-cyan-400/40 bg-cyan-400/[0.08]"
                            : "border-slate-700/70 bg-[#091426]/80"
                        }`}
                      >
                        {/* PLAYER AND RANK */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-2">
                            <span
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                                rank === 1
                                  ? "bg-amber-400/15 text-amber-300"
                                  : rank === 2
                                    ? "bg-slate-300/10 text-slate-200"
                                    : rank === 3
                                      ? "bg-orange-400/10 text-orange-300"
                                      : "bg-slate-800 text-slate-400"
                              }`}
                            >
                              {pending ? "—" : rank}
                            </span>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="truncate text-sm font-bold text-white">
                                  {row.display_name || row.user_id || "Player"}
                                </span>

                                {mine && (
                                  <span className="rounded border border-cyan-400/30 bg-cyan-400/10 px-1.5 py-0.5 text-[8px] font-black uppercase text-cyan-200">
                                    You
                                  </span>
                                )}
                              </div>

                              <p className="mt-0.5 truncate text-[10px] text-slate-400">
                                {row.bracket_name || "Bracket"}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                              Points
                            </p>
                            {pending ? (
                              <span className="text-xs font-bold text-amber-300">
                                Pending
                              </span>
                            ) : (
                              <span className="text-xl font-black tabular-nums text-cyan-200">
                                {row.total_points ?? 0}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* POINT TOTALS */}
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <div className="rounded-lg border border-slate-700/60 bg-slate-800/40 px-3 py-2">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                              Max Possible
                            </p>
                            <p className="mt-0.5 text-sm font-bold tabular-nums text-slate-200">
                              {row.max_possible_points ?? "—"}
                            </p>
                          </div>

                          <div className="rounded-lg border border-slate-700/60 bg-slate-800/40 px-3 py-2">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                              Champion Pick
                            </p>
                            <p className="mt-0.5 truncate text-sm font-semibold text-slate-300">
                              {championPicksLocked
                                ? "Hidden"
                                : row.champion_pick || "—"}
                            </p>
                          </div>
                        </div>

                        {/* PAYMENT STATUS */}
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] pt-3">
                          <div>
                            {row.has_paid === true ? (
                              <span className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[9px] font-extrabold text-emerald-300">
                                PAID ✓
                              </span>
                            ) : row.has_paid === false ? (
                              <span className="inline-flex rounded-full border border-red-400/30 bg-red-500/10 px-2.5 py-1 text-[9px] font-extrabold text-red-300">
                                NOT PAID
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-500">
                                Payment —
                              </span>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* DESKTOP LEADERBOARD TABLE */}
                <div className="hidden w-full lg:block">
                  <table className="w-full table-fixed border-collapse text-left">
                    <thead>
                      <tr className="border-b border-slate-700/70 bg-[#091426]/80 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                        <th className="w-[8%] px-1 py-2.5 text-center">
                          Rank
                        </th>
                        <th className="w-[17%] px-1 py-2.5">Player</th>
                        <th className="w-[16%] px-1 py-2.5">Bracket</th>
                        <th className="w-[15%] px-1 py-2.5">Champion</th>
                        <th className="w-[10%] px-1 py-2.5 text-right">
                          Points
                        </th>
                        <th className="w-[18%] px-1 py-2.5 text-right">
                          Max Possible
                        </th>
                        <th className="w-[16%] px-1 py-2.5 text-center">
                          Payment
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {leaderboard.map((row, index) => {
                        const mine = isCurrentUser(row);
                        const pending = row.scoring_status === "pending";
                        const rank = row.rank ?? index + 1;

                        return (
                          <tr
                            key={`${row.bracket_id}-${index}`}
                            className={`border-b border-white/[0.05] transition ${
                              mine
                                ? "bg-cyan-400/[0.09] shadow-[inset_3px_0_0_rgba(34,211,238,0.9)]"
                                : index % 2 === 0
                                  ? "bg-white/[0.015]"
                                  : "bg-transparent"
                            } hover:bg-cyan-400/[0.06]`}
                          >
                            <td className="px-3 py-3 text-center sm:px-4">
                              <span
                                className={`inline-flex h-7 min-w-7 items-center justify-center rounded-lg px-2 text-xs font-black ${
                                  rank === 1
                                    ? "bg-amber-400/15 text-amber-300"
                                    : rank === 2
                                      ? "bg-slate-300/10 text-slate-200"
                                      : rank === 3
                                        ? "bg-orange-400/10 text-orange-300"
                                        : "bg-slate-800 text-slate-400"
                                }`}
                              >
                                {pending ? "—" : rank}
                              </span>
                            </td>

                            <td className="px-2 py-3">
                              <div className="flex items-center gap-1.5">
                                <span className="max-w-[135px] truncate text-xs font-bold text-white">
                                  {row.display_name || row.user_id || "Player"}
                                </span>
                                {mine && (
                                  <span className="rounded border border-cyan-400/30 bg-cyan-400/10 px-1 py-0.5 text-[8px] font-black uppercase text-cyan-200">
                                    You
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="px-2 py-3">
                              <span className="block max-w-[130px] truncate text-[11px] text-slate-300">
                                {row.bracket_name || "Bracket"}
                              </span>
                            </td>

                            <td className="px-2 py-3">
                              <span className="block max-w-[110px] truncate text-[10px] text-slate-400">
                                {championPicksLocked
                                  ? "Hidden"
                                  : row.champion_pick || "—"}
                              </span>
                            </td>

                            <td className="px-2 py-3 text-right">
                              {pending ? (
                                <span className="text-[10px] font-bold text-amber-300">
                                  Pending
                                </span>
                              ) : (
                                <span className="text-sm font-black tabular-nums text-cyan-200">
                                  {row.total_points ?? 0}
                                </span>
                              )}
                            </td>

                            <td className="px-3 py-3 text-right sm:px-4">
                              <span className="text-xs font-bold tabular-nums text-slate-300">
                                {row.max_possible_points ?? "—"}
                              </span>
                            </td>

                            {/* PAYMENT STATUS */}
                            <td className="px-2 py-3 text-center">
                              {row.has_paid === true ? (
                                <span className="inline-flex whitespace-nowrap rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-[9px] font-extrabold tracking-wide text-emerald-300">
                                  PAID ✓
                                </span>
                              ) : row.has_paid === false ? (
                                <span className="inline-flex whitespace-nowrap rounded-full border border-red-400/30 bg-red-500/10 px-2 py-1 text-[9px] font-extrabold tracking-wide text-red-300">
                                  NOT PAID
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-500">
                                  —
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col justify-between gap-1 border-t border-white/[0.06] bg-[#091426]/60 px-4 py-2.5 text-[9px] text-slate-500 sm:flex-row sm:items-center">
                  <span>
                    {scoredEntries} scored
                    <span className="mx-1.5 text-slate-700">•</span>
                    {leaderboard.length} total entries
                  </span>
                  <span>
                    Last Updated: Live
                    <span className="mx-1.5 text-slate-700">•</span>
                    Admin Tools: Recalculate Scores
                  </span>
                </div>
              </>
            )}
          </section>

          {/* Supporting column */}
          <div className="flex min-w-0 flex-col gap-4">
            {/* FORUM */}
            <section className="overflow-hidden rounded-2xl border border-slate-700/70 bg-[#0d1a2e]/95 shadow-[0_12px_35px_rgba(0,0,0,0.2)]">
              <div className="border-b border-white/[0.07] bg-gradient-to-r from-[#142640] to-[#0e1c31] px-4 py-3">
                <div className="text-[9px] font-bold uppercase tracking-[0.25em] text-cyan-300">
                  The Conversation
                </div>
                <h2 className="mt-0.5 text-lg font-black text-white">
                  BracketBoss Forum
                </h2>
                <p className="mt-0.5 text-[10px] text-slate-400">
                  Talk hoops, debate picks, and share your tournament takes.
                </p>
              </div>

              <div className="p-3">
                <Forum currentUser={currentUser} />
              </div>
            </section>

            {/* MOST PICKED CHAMPIONS */}
            <section className="overflow-hidden rounded-2xl border border-slate-700/70 bg-[#0d1a2e]/95 shadow-[0_12px_35px_rgba(0,0,0,0.2)]">
              <div className="border-b border-white/[0.07] bg-gradient-to-r from-[#142640] to-[#0e1c31] px-4 py-3">
                <div className="text-[9px] font-bold uppercase tracking-[0.25em] text-cyan-300">
                  The Field's Favorites
                </div>
                <h2 className="mt-0.5 text-lg font-black text-white">
                  Most Picked Champions
                </h2>
                <p className="mt-0.5 text-[10px] text-slate-400">
                  Which teams are players backing to win it all?
                </p>
              </div>

              <div className="p-4">
                {championPicksLocked ? (
                  <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-3 py-5 text-center">
                    <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg border border-amber-400/20 bg-amber-400/10 text-lg">
                      🔒
                    </div>
                    <p className="text-xs font-extrabold text-amber-200">
                      Champion Picks Are Locked
                    </p>
                    <p className="mx-auto mt-1.5 max-w-xs text-[10px] leading-relaxed text-slate-400">
                      Popular championship selections will be revealed after
                      the pick deadline.
                    </p>
                    {formattedLockTime && (
                      <p className="mt-2 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                        Lock Time: {formattedLockTime}
                      </p>
                    )}
                  </div>
                ) : topChampionPicks.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-700 bg-[#091426]/60 px-3 py-6 text-center">
                    <p className="text-xs font-bold text-slate-300">
                      No champion picks yet.
                    </p>
                    <p className="mt-1 text-[10px] text-slate-500">
                      Team selections will appear here once submitted.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {topChampionPicks.slice(0, 5).map((team, index) => (
                      <div key={team.team_id}>
                        <div className="mb-1.5 flex items-center justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <span
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-black ${
                                index === 0
                                  ? "bg-amber-400/15 text-amber-300"
                                  : "bg-slate-800 text-slate-400"
                              }`}
                            >
                              {index + 1}
                            </span>
                            <span className="truncate text-xs font-bold text-slate-100">
                              {team.team_name}
                            </span>
                          </div>

                          <div className="shrink-0 text-right">
                            <span className="text-xs font-black tabular-nums text-cyan-200">
                              {team.percentage}%
                            </span>
                            <span className="ml-1.5 text-[9px] text-slate-500">
                              ({team.count})
                            </span>
                          </div>
                        </div>

                        <div className="ml-8 h-1.5 overflow-hidden rounded-full bg-slate-800">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                            style={{
                              width: `${Math.max(
                                0,
                                Math.min(100, team.percentage)
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="relative z-10 mt-5 border-t border-slate-800/80 bg-[#080f20]/80 px-4 py-4 text-center">
        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500">
          Where Madness Meets Mastery
        </p>
        <p className="mt-1 text-[9px] text-slate-700">BracketBoss</p>
      </footer>

      <BracketBossHelper />
    </div>
  );
}
