// app/(app)/sports/nfl/weekly/WeeklyClient.tsx

"use client";

import { useEffect, useState, useMemo } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import type { WeeklyGame, Team } from "@/lib/sports/weekly";

type Props = {
  sport: "NFL";
  week: number;
  games: WeeklyGame[];
  teamsById: Record<string, Team>;
  lockTime: string | null;
};

export default function WeeklyClient({
  sport,
  week,
  games,
  teamsById,
  lockTime,
}: Props) {
  const supabase = createSupabaseBrowserClient();

  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [usedTeams, setUsedTeams] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isLocked = useMemo(() => {
    if (!lockTime) return false;
    return new Date(lockTime) <= new Date();
  }, [lockTime]);

  useEffect(() => {
    async function loadUsedTeams() {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      const { data } = await supabase
        .from("user_picks")
        .select("winner_team_id")
        .eq("user_id", user.id)
        .eq("sport", "NFL");

      setUsedTeams(data?.map((p) => p.winner_team_id) ?? []);
    }

    loadUsedTeams();
  }, []);

  useEffect(() => {
    async function loadExistingPick() {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      const { data } = await supabase
        .from("user_picks")
        .select("winner_team_id")
        .eq("user_id", user.id)
        .eq("sport", "NFL")
        .eq("week_number", week)
        .maybeSingle();

      if (data?.winner_team_id) {
        setSelectedTeam(data.winner_team_id);
      }
    }

    loadExistingPick();
  }, [week]);

  const teams = useMemo(() => {
    const list: {
      id: string;
      name: string;
      abbreviation: string;
      logo_url?: string;
      opponent?: string;
    }[] = [];

    games.forEach((g) => {
      const home = teamsById[g.home_team_id];
      const away = teamsById[g.away_team_id];

      if (home) {
        list.push({
          id: home.id,
          name: home.name,
          abbreviation: home.abbreviation,
          logo_url: (home as any).logo_url,
          opponent: away?.name,
        });
      }

      if (away) {
        list.push({
          id: away.id,
          name: away.name,
          abbreviation: away.abbreviation,
          logo_url: (away as any).logo_url,
          opponent: home?.name,
        });
      }
    });

    return list;
  }, [games, teamsById]);

  const handleSubmit = async () => {
    if (!selectedTeam) {
      setError("Please select a team.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        setError("You must be logged in to submit picks.");
        return;
      }

      const payload = {
        user_id: user.id,
        game_id: games[0]?.id ?? 0,
        sport: "NFL",
        week_number: week,
        winner_team_id: selectedTeam,
      };

      const { error: insertError } = await supabase
        .from("user_picks")
        .upsert(payload, {
          onConflict: "user_id,game_id,sport,week_number",
        });

      if (insertError) {
        setError(insertError.message);
      } else {
        setSuccess("Pick saved successfully.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            NFL Weekly Challenge — Week {week}
          </h1>
          {lockTime && (
            <p className="text-sm text-muted-foreground">
              Lock time: {new Date(lockTime).toLocaleString()}
            </p>
          )}
        </div>

        <button
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
          onClick={handleSubmit}
          disabled={isLocked || submitting || !selectedTeam}
        >
          {isLocked ? "Locked" : submitting ? "Saving…" : "Submit Pick"}
        </button>
      </header>

      {error && (
        <div className="rounded bg-red-100 text-red-800 px-3 py-2 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded bg-green-100 text-green-800 px-3 py-2 text-sm">
          {success}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {teams.map((team) => {
          const isUsed = usedTeams.includes(team.id);
          const isSelected = selectedTeam === team.id;

          return (
            <button
              key={team.id}
              onClick={() => !isLocked && !isUsed && setSelectedTeam(team.id)}
              disabled={isUsed || isLocked}
              className={[
                "rounded-xl border p-4 flex flex-col items-center gap-2 transition",
                isUsed
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:bg-slate-800 hover:border-blue-600",
                isSelected ? "border-blue-600 bg-blue-50 text-black" : "",
              ].join(" ")}
            >
              {team.logo_url && (
                <img
                  src={team.logo_url}
                  alt={team.name}
                  className="w-16 h-16 rounded-full object-contain"
                />
              )}

              <span className="font-semibold text-center">{team.name}</span>

              {team.opponent && (
                <span className="text-xs text-slate-400">
                  vs {team.opponent}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {teams.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No teams found for Week {week}.
        </p>
      )}
    </div>
  );
}

