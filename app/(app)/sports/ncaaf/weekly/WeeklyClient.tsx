"use client";

import { useEffect, useState, useMemo } from "react";
import WeekSelector from "./WeekSelector";
import ConferenceFilter from "./ConferenceFilter";
import CountdownTimer from "./CountdownTimer";
import MatchupGrid from "./MatchupGrid";

type Props = {
  seasonYear: number;
  week: number;
  games: any[];
  teamsById: Record<string, any>;
  lockTime: string | null;
  allWeeks: number[];
  prevWeek: number | null;
  nextWeek: number | null;

  // Passed from WeeklyShell
  userEmail: string;
  mode: "GLOBAL" | "GROUP";
  groupCode?: string;
};

export default function WeeklyClient({
  seasonYear,
  week,
  games,
  teamsById,
  lockTime,
  allWeeks,
  prevWeek,
  nextWeek,
  userEmail,
  mode,
  groupCode,
}: Props) {
  const [filter, setFilter] = useState<string>("ALL");
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [fade, setFade] = useState(false);

  // Fade animation on week change
  useEffect(() => {
    setFade(true);
    const t = setTimeout(() => setFade(false), 250);
    return () => clearTimeout(t);
  }, [week]);

  const isLocked = useMemo(() => {
    if (!lockTime) return false;
    return new Date(lockTime) <= new Date();
  }, [lockTime]);

  // ⭐ Load existing picks
  useEffect(() => {
    const loadPicks = async () => {
      const res = await fetch(
        `/api/ncaaf/picks/get?email=${encodeURIComponent(
          userEmail
        )}&seasonYear=${seasonYear}&week=${week}&mode=${mode}&groupCode=${
          groupCode ?? ""
        }`
      );

      const json = await res.json();

      if (json.picks && Array.isArray(json.picks)) {
        const map: Record<string, string> = {};
        json.picks.forEach((p: any) => {
          map[p.game_id] = p.picked_team_id;
        });
        setSelected(map);
      }
    };

    loadPicks();
  }, [userEmail, seasonYear, week, mode, groupCode]);

  const filteredGames = useMemo(() => {
    if (filter === "ALL") return games;

    return games.filter((g) => {
      const home = teamsById[g.home_team_id];
      const away = teamsById[g.away_team_id];

      const confs = [home?.conference, away?.conference];

      if (filter === "POWER5") {
        return confs.some((c) =>
          ["SEC", "ACC", "Big Ten", "Big 12", "Pac-12"].includes(c)
        );
      }

      if (filter === "G5") {
        return confs.some((c) =>
          ["AAC", "C-USA", "MAC", "Mountain West", "Sun Belt"].includes(c)
        );
      }

      if (filter === "INDEPENDENT") {
        return confs.some((c) => c === "Independent");
      }

      return true;
    });
  }, [filter, games, teamsById]);

  const handlePick = (gameId: string, teamId: string) => {
    if (isLocked) return;
    setSelected((prev) => ({ ...prev, [gameId]: teamId }));
  };

  // ⭐ Submit picks
  const handleSubmit = async () => {
    if (isLocked) return;

    const picksPayload = Object.entries(selected).map(
      ([gameId, teamId]) => ({
        gameId,
        teamId,
      })
    );

    const res = await fetch("/api/ncaaf/picks", {
      method: "POST",
      body: JSON.stringify({
        email: userEmail,
        seasonYear,
        week,
        picks: picksPayload,
        mode,
        groupCode,
      }),
    });

    const json = await res.json();

    if (json.error) {
      alert(json.error);
      return;
    }

    alert("Picks saved!");
  };

  return (
    <div className="flex flex-col gap-6">

      <WeekSelector
        week={week}
        allWeeks={allWeeks}
        prevWeek={prevWeek}
        nextWeek={nextWeek}
      />

      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">
            NCAAF Weekly Pick’em — Week {week}
          </h1>

          {/* ⭐ Mode label */}
          <div className="text-sm text-[var(--bb-gold)] mt-1">
            {mode === "GLOBAL"
              ? "Playing: Global Leaderboard"
              : `Playing: Private Group (${groupCode})`}
          </div>

          {/* ⭐ Leaderboard link */}
          <a
            href={
              mode === "GLOBAL"
                ? "/sports/ncaaf/leaderboard/global"
                : `/sports/ncaaf/leaderboard/group?groupCode=${groupCode}`
            }
            className="text-sm text-[var(--bb-gold)] hover:text-white mt-1 inline-block"
          >
            View Leaderboard →
          </a>

          {lockTime && (
            <CountdownTimer lockTime={lockTime} />
          )}

          {/* ⭐ Saved picks indicator */}
          {Object.keys(selected).length > 0 && (
            <p className="text-xs text-[var(--bb-gold)] mt-1">
              {isLocked ? "Picks locked" : "Your saved picks are loaded"}
            </p>
          )}
        </div>

        <button
          className="px-4 py-2 rounded bg-[var(--bb-green)] text-white disabled:opacity-50"
          disabled={isLocked}
          onClick={handleSubmit}
        >
          {isLocked ? "Locked" : "Submit Picks"}
        </button>
      </header>

      <ConferenceFilter filter={filter} setFilter={setFilter} />

      <div
        className={`transition-opacity duration-300 ${
          fade ? "opacity-0" : "opacity-100"
        }`}
      >
        <MatchupGrid
          games={filteredGames}
          teamsById={teamsById}
          selected={selected}
          onPick={handlePick}
          isLocked={isLocked}
        />
      </div>

      {filteredGames.length === 0 && (
        <p className="text-sm text-slate-400">
          No matchups found for this filter.
        </p>
      )}
    </div>
  );
}
