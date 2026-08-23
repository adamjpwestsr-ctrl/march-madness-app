"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDraftQueue } from "@/hooks/useDraftQueue";
import QueueSortableList from "@/components/QueueSortableList";
import PlayerComparisonModal from "@/components/PlayerComparisonModal";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";

export default function FantasyDraftRoom() {
  const params = useSearchParams();
  const router = useRouter();
  const leagueId = params.get("leagueId");

  const [loading, setLoading] = useState(true);

  // League metadata
  const [league, setLeague] = useState<any>(null);

  // Draft state
  const [currentPick, setCurrentPick] = useState(1);
  const [onTheClock, setOnTheClock] = useState<number | null>(null);
  const [timer, setTimer] = useState(0);

  // Player pool
  const [players, setPlayers] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  // Draft history
  const [history, setHistory] = useState<any[]>([]);

  // Big board (team → picks)
  const [teams, setTeams] = useState<any[]>([]);

  // Total players drafted per team
  const rosterSize = 15;

  // Draft queue (persistent)
  const { queue, removeFromQueue, updateRank } = useDraftQueue();

  // Real-time
  const channelRef = useRef<any>(null);
  const [isHost, setIsHost] = useState(false);

  // Player Comparison Modal State
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareA, setCompareA] = useState<any>(null);
  const [compareB, setCompareB] = useState<any>(null);

  // Load league + teams + players
  useEffect(() => {
    const load = async () => {
      if (!leagueId) return;
      setLoading(true);

      // Load league
      const res = await fetch(`/api/fantasy/league/get?leagueId=${leagueId}`);
      const json = await res.json();
      setLeague(json);

      // Load teams
      const teamsRes = await fetch(
        `/api/fantasy/league/teams?leagueId=${leagueId}`
      );
      const teamsJson = await teamsRes.json();
      setTeams(teamsJson);

      // Load players
      const playersRes = await fetch("/api/fantasy/players");
      const playersJson = await playersRes.json();
      setPlayers(playersJson.players || []);

      // Set initial timer
      setTimer(json.pickTimer);

      // Set first team on the clock
      setOnTheClock(json.draftOrder[0]);

      setLoading(false);
    };

    load();
  }, [leagueId]);

  // Join Supabase channel (broadcast) — subscribe once per leagueId
  useEffect(() => {
    if (!leagueId) return;
    if (channelRef.current) return; // already subscribed

    const supabase = createSupabaseBrowserClient();
    const ch = supabase.channel(`draft-${leagueId}`);

    ch.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        const hostKey = `draft-host-${leagueId}`;
        if (!localStorage.getItem(hostKey)) {
          localStorage.setItem(hostKey, "true");
          setIsHost(true);
        } else {
          setIsHost(false);
        }
      }
    });

    // Listen for player_drafted
    ch.on("broadcast", { event: "player_drafted" }, ({ payload }: any) => {
      // league is read from state; we don't re-subscribe when it changes
      setLeague((currentLeague: any) => {
        if (!currentLeague || isHost) return currentLeague;

        const {
          player_id,
          team_id,
          pick_number,
          name,
          position,
          team,
        } = payload;

        // Remove from queue
        removeFromQueue(player_id);

        // Update history
        setHistory((h) => [
          ...h,
          {
            pick: pick_number,
            teamId: team_id,
            playerId: player_id,
            name,
            position,
            team,
          },
        ]);

        // Update big board
        setTeams((prev) =>
          prev.map((t) =>
            t.id === team_id
              ? {
                  ...t,
                  picks: [
                    ...(t.picks || []),
                    { id: player_id, name, position, team },
                  ],
                }
              : t
          )
        );

        // Advance pick
        const nextPick = pick_number + 1;
        const totalPicks = currentLeague.numTeams * rosterSize;

        if (nextPick > totalPicks) {
          router.push("/sports/nfl/fantasy");
          return currentLeague;
        }

        setCurrentPick(nextPick);

        const nextTeam =
          currentLeague.draftType === "snake"
            ? getSnakeTeam(
                nextPick,
                currentLeague.numTeams,
                currentLeague.draftOrder
              )
            : currentLeague.draftOrder[(nextPick - 1) % currentLeague.numTeams];

        setOnTheClock(nextTeam);
        setTimer(currentLeague.pickTimer);

        return currentLeague;
      });
    });

    // Listen for timer_tick
    ch.on("broadcast", { event: "timer_tick" }, ({ payload }: any) => {
      if (isHost) return;
      setTimer(payload.timer);
    });

    channelRef.current = ch;

    return () => {
      ch.unsubscribe();
      channelRef.current = null;
    };
  }, [leagueId, isHost, removeFromQueue, router]);

  // Snake draft logic
  const getSnakeTeam = (
    pick: number,
    numTeams: number,
    order: number[]
  ) => {
    const round = Math.ceil(pick / numTeams);
    const index = (pick - 1) % numTeams;

    if (round % 2 === 1) {
      return order[index];
    } else {
      return order[numTeams - 1 - index];
    }
  };

  // Make a pick
  const makePick = async (player: any) => {
    const teamId = onTheClock;

    // Save pick
    await fetch("/api/fantasy/league/pick", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leagueId,
        teamId,
        pickNumber: currentPick,
        playerId: player.id,
      }),
    });

    // Update history
    setHistory((h) => [
      ...h,
      {
        pick: currentPick,
        teamId,
        playerId: player.id,
        name: player.name,
        position: player.position,
        team: player.team,
      },
    ]);

    // Update big board
    setTeams((prev) =>
      prev.map((t) =>
        t.id === teamId
          ? { ...t, picks: [...(t.picks || []), player] }
          : t
      )
    );

    // Remove from queue if present
    removeFromQueue(player.id);

    // Broadcast pick
    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "player_drafted",
        payload: {
          player_id: player.id,
          team_id: teamId,
          pick_number: currentPick,
          name: player.name,
          position: player.position,
          team: player.team,
        },
      });
    }

    // Advance pick
    const nextPick = currentPick + 1;
    const totalPicks = league.numTeams * rosterSize;

    // FINAL PICK → finalize draft
    if (nextPick > totalPicks) {
      await fetch("/api/fantasy/league/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leagueId,
          userId: league.user_id,
          season: league.season,
        }),
      });

      router.push("/sports/nfl/fantasy");
      return;
    }

    // Continue draft
    setCurrentPick(nextPick);

    const nextTeam =
      league.draftType === "snake"
        ? getSnakeTeam(nextPick, league.numTeams, league.draftOrder)
        : league.draftOrder[(nextPick - 1) % league.numTeams];

    setOnTheClock(nextTeam);
    setTimer(league.pickTimer);
  };

  // Auto-pick (queue-aware, then best available)
  const autoPick = useCallback(() => {
    const available = players.filter(
      (p) => !history.some((h) => h.playerId === p.id)
    );
    if (available.length === 0) return;

    // Try queue first
    if (queue.length > 0) {
      const queuedPlayer = available.find(
        (p) => p.id === queue[0].player_id
      );
      if (queuedPlayer) {
        makePick(queuedPlayer);
        return;
      }
    }

    // Fallback: best available
    const best = available[0];
    makePick(best);
  }, [players, history, queue]);

  // Timer countdown (host only, broadcast to others)
  useEffect(() => {
    if (!onTheClock || !isHost) return;

    if (timer === 0) {
      autoPick();
      return;
    }

    const interval = setInterval(() => {
      setTimer((t) => {
        const next = t - 1;
        if (channelRef.current) {
          channelRef.current.send({
            type: "broadcast",
            event: "timer_tick",
            payload: { timer: next },
          });
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, onTheClock, autoPick, isHost]);

  if (loading || !league) {
    return <p className="text-slate-400 p-6">Loading draft room...</p>;
  }

  return (
    <div className="p-6 space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Fantasy Draft Room
        </h1>
        <p className="text-slate-400">
          League: {league.leagueName} • Season {league.season}
        </p>
      </div>

      {/* ON THE CLOCK */}
      <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl">
        <h2 className="text-xl font-semibold text-white mb-3">
          Pick {currentPick} — Team {onTheClock} is on the clock
        </h2>

        <p className="text-emerald-400 text-lg font-bold">
          {timer} seconds remaining
        </p>
      </div>

      {/* GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* PLAYER LIST */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-700 p-6 rounded-xl">
          <h2 className="text-xl font-semibold text-white mb-4">
            Available Players
          </h2>

          <input
            className="w-full p-2 mb-4 rounded bg-slate-800 text-white"
            placeholder="Search players..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {players
              .filter(
                (p) =>
                  !history.some((h) => h.playerId === p.id) &&
                  p.name.toLowerCase().includes(search.toLowerCase())
              )
              .map((p) => (
                <div
                  key={p.id}
                  className="flex justify-between items-center p-3 bg-slate-800 rounded"
                >
                  <div>
                    <div className="text-white font-semibold">{p.name}</div>
                    <div className="text-slate-400 text-sm">
                      {p.team} • {p.position}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1 bg-blue-600 text-white rounded"
                      onClick={() => makePick(p)}
                    >
                      Draft
                    </button>

                    <button
                      className="px-3 py-1 bg-slate-600 text-white rounded"
                      onClick={() => {
                        if (!compareA) {
                          setCompareA(p);
                        } else {
                          setCompareB(p);
                          setCompareOpen(true);
                        }
                      }}
                    >
                      Compare
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Draft History + Queue */}
        <div className="space-y-6">
          {/* DRAFT HISTORY */}
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4">
              Draft History
            </h2>

            <div className="space-y-2 max-h-[280px] overflow-y-auto">
              {history.map((h) => (
                <div
                  key={h.pick}
                  className="p-3 bg-slate-800 rounded text-white"
                >
                  <div className="font-semibold">
                    Pick {h.pick}: {h.name}
                  </div>
                  <div className="text-slate-400 text-sm">
                    Team {h.teamId} • {h.team} • {h.position}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* QUEUE SIDEBAR WITH DRAG-AND-DROP */}
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4">
              My Draft Queue
            </h2>

            {queue.length === 0 ? (
              <p className="text-slate-400">No queued players yet.</p>
            ) : (
              <div className="space-y-2 max-h-[280px] overflow-y-auto">
                <QueueSortableList
                  queue={queue}
                  players={players}
                  updateRank={updateRank}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BIG BOARD */}
      <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl">
        <h2 className="text-xl font-semibold text-white mb-4">
          Big Board
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teams.map((t) => (
            <div
              key={t.id}
              className="bg-slate-800 border border-slate-700 p-4 rounded-lg"
            >
              <h3 className="text-white font-bold mb-2">
                Team {t.id}
              </h3>

              {t.picks?.length === 0 ? (
                <p className="text-slate-500 text-sm">No picks yet.</p>
              ) : (
                <ul className="text-slate-300 text-sm space-y-1">
                  {t.picks.map((p: any, idx: number) => (
                    <li key={idx}>
                      {p.name} — {p.team} • {p.position}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Player Comparison Modal */}
      <PlayerComparisonModal
        open={compareOpen}
        onClose={() => {
          setCompareOpen(false);
          setCompareA(null);
          setCompareB(null);
        }}
        playerA={compareA}
        playerB={compareB}
      />
    </div>
  );
}
