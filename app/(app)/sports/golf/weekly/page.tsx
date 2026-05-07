"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Tournament = {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  course: string | null;
  par: number | null;
  week_number: number | null;
  category: string | null;
  is_premium_event: boolean | null;
};

type Golfer = {
  id: number;
  name: string;
  country: string | null;
  photo_url: string | null;
  is_active: boolean;
};

export default function GolfWeeklyPage() {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [golfers, setGolfers] = useState<Golfer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      const today = new Date().toISOString().split("T")[0];

      // Fetch next upcoming tournament
      const { data: event } = await supabase
        .from("golf_tournaments")
        .select("*")
        .gte("start_date", today)
        .order("start_date", { ascending: true })
        .limit(1)
        .single();

      // Fetch active golfers
      const { data: field } = await supabase
        .from("golf_players")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });

      setTournament(event);
      setGolfers(field || []);
      setLoading(false);
    }

    loadData();
  }, []);

  return (
    <div className="space-y-10">
      {/* Header */}
      <section>
        <h1 className="text-3xl font-semibold mb-2">Golf Weekly Challenge</h1>
        <p className="text-slate-400 max-w-2xl">
          Pick golfers for this week’s PGA event. Earn points based on their
          performance and climb the leaderboard.
        </p>
      </section>

      {/* CTA */}
      <section>
        <Link
          href="/sports/golf/weekly/picks"
          className="inline-block px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
        >
          Make Your Picks
        </Link>
      </section>

      {/* Tournament + Field */}
      <section className="rounded-xl border border-slate-800 p-6 bg-slate-900/40">
        <h2 className="text-xl font-semibold mb-4">This Week’s Field</h2>

        {loading && <p className="text-slate-400">Loading golfers…</p>}

        {!loading && tournament && (
          <>
            <p className="text-slate-300 mb-4">
              <strong>{tournament.name}</strong> — {tournament.course || "TBD"} (
              {new Date(tournament.start_date).toLocaleDateString()} →{" "}
              {new Date(tournament.end_date).toLocaleDateString()})
            </p>

            <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-2 text-slate-400">
              {golfers.map((g) => (
                <li
                  key={g.id}
                  className="border border-slate-800 rounded-lg p-3 hover:bg-slate-800/40 flex items-center gap-3"
                >
                  {g.photo_url && (
                    <img
                      src={g.photo_url}
                      alt={g.name}
                      className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                    />
                  )}
                  <div>
                    <span className="font-medium text-white">{g.name}</span>
                    {g.country && (
                      <span className="text-slate-500 text-sm ml-2">
                        ({g.country})
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        {!loading && !tournament && (
          <p className="text-slate-400">No upcoming tournament found.</p>
        )}
      </section>

      {/* Scoring */}
      <section className="rounded-xl border border-slate-800 p-6 bg-slate-900/40">
        <h2 className="text-xl font-semibold mb-4">Scoring</h2>
        <ul className="text-slate-400 list-disc pl-6 space-y-2">
          <li>Points based on finishing position</li>
          <li>Bonus points for top‑10 finishes</li>
          <li>Leaderboard updates after each round</li>
        </ul>
      </section>
    </div>
  );
}
