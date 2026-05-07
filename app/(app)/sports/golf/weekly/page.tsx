"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Golfer = {
  id: number;
  name: string;
  country: string;
  ranking: number;
};

type Tournament = {
  id: number;
  name: string;
  start_date: string;
  location: string;
};

export default function GolfWeeklyPage() {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [golfers, setGolfers] = useState<Golfer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const { data: event } = await supabase
        .from("golf_tournaments")
        .select("*")
        .eq("active", true)
        .single();

      const { data: field } = await supabase
        .from("golfers")
        .select("*")
        .order("ranking", { ascending: true });

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

      {/* Field */}
      <section className="rounded-xl border border-slate-800 p-6 bg-slate-900/40">
        <h2 className="text-xl font-semibold mb-4">This Week’s Field</h2>
        {loading && <p className="text-slate-400">Loading golfers…</p>}
        {!loading && tournament && (
          <>
            <p className="text-slate-300 mb-4">
              <strong>{tournament.name}</strong> — {tournament.location} (
              {new Date(tournament.start_date).toLocaleDateString()})
            </p>
            <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-2 text-slate-400">
              {golfers.map((g) => (
                <li
                  key={g.id}
                  className="border border-slate-800 rounded-lg p-3 hover:bg-slate-800/40"
                >
                  <span className="font-medium text-white">{g.name}</span>{" "}
                  <span className="text-slate-500 text-sm">
                    #{g.ranking} • {g.country}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
        {!loading && !tournament && (
          <p className="text-slate-400">No active tournament found.</p>
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
