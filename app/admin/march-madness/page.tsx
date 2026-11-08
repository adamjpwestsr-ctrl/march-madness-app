'use client';

import { useRouter } from 'next/navigation';

export default function MarchMadnessAdminPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-900 p-10 text-gray-100">
      <h1 className="mb-8 text-4xl font-bold">
        March Madness Admin
      </h1>

      {/* PRIMARY ADMIN NAVIGATION */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">

        {/* OPENING ROUND EDITOR */}
        <button
          onClick={() =>
            router.push('/admin/march-madness/opening-round')
          }
          className="rounded-xl border border-slate-600 bg-slate-800 p-6 text-left text-xl font-bold transition hover:bg-slate-700"
        >
          🏀 Opening Round Editor

          <p className="mt-3 text-sm font-normal text-slate-300">
            Configure the 12 Opening Round games by pairing the 24 teams
            and wiring winners into Round of 64 slots.
          </p>
        </button>

        {/* FULL BRACKET EDITOR */}
        <button
          onClick={() =>
            router.push('/admin/march-madness/full-bracket')
          }
          className="rounded-xl border border-slate-600 bg-slate-800 p-6 text-left text-xl font-bold transition hover:bg-slate-700"
        >
          📋 Full Bracket Editor

          <p className="mt-3 text-sm font-normal text-slate-300">
            Configure tournament matchups from the Round of 64 through
            the Championship, including team advancement paths.
          </p>
        </button>

        {/* GAME RESULTS AND SCORES */}
        <button
          onClick={() =>
            router.push('/admin/march-madness/results')
          }
          className="rounded-xl border border-emerald-600 bg-emerald-900 p-6 text-left text-xl font-bold transition hover:bg-emerald-800"
        >
          🏆 Game Results & Scores

          <p className="mt-3 text-sm font-normal text-emerald-100">
            Enter final game scores, automatically determine winners,
            and advance winning teams through the tournament.
          </p>
        </button>

      </div>
    </div>
  );
}
