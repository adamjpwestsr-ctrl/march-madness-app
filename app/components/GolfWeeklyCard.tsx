"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Tournament {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  category: string | null;
  is_premium_event: boolean | null;
}

export default function GolfWeeklyCard() {
  const [tournament, setTournament] = useState<Tournament | null>(null);

  useEffect(() => {
    fetch("/api/golf/weekly/state")
      .then((res) => res.json())
      .then((data) => {
        setTournament(data.tournament ?? null);
      })
      .catch(() => {});
  }, []);

  const premiumLabel = (t: Tournament) => {
    if (!t.is_premium_event) return null;
    if (t.category === "major") return "Major";
    if (t.category === "signature") return "Signature";
    if (t.category === "fedex") return "FedEx Cup";
    return "Premium";
  };

  return (
    <Link href="/sports/golf/weekly">
      <div
        className="
          h-[190px]                     /* ⭐ Match ChallengeCard height */
          flex flex-col justify-between /* ⭐ Even vertical spacing */
          rounded-xl
          border border-slate-800
          bg-slate-900
          p-6
          shadow
          hover:scale-[1.02]
          hover:border-sky-500
          transition
          cursor-pointer
        "
      >
        {/* Top Section */}
        <div>
          {/* Sport Badge */}
          <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-br from-green-600 to-green-800 mb-3">
            Golf
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold leading-tight mb-1">
            Golf Weekly
          </h3>

          {/* Tournament Info */}
          {tournament ? (
            <>
              <p className="text-sm text-slate-300 font-medium">
                {tournament.name}
              </p>

              <p className="text-xs text-slate-500 mb-2">
                {new Date(tournament.start_date).toLocaleDateString()} –{" "}
                {new Date(tournament.end_date).toLocaleDateString()}
              </p>

              {premiumLabel(tournament) && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] uppercase tracking-wide rounded-full bg-yellow-500/10 text-yellow-300 border border-yellow-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                  {premiumLabel(tournament)}
                </span>
              )}
            </>
          ) : (
            <p className="text-sm text-slate-500 mb-2">
              Next tournament coming soon.
            </p>
          )}
        </div>

        {/* Bottom Status */}
        <div className="text-sm font-medium text-emerald-400">Open</div>
      </div>
    </Link>
  );
}
