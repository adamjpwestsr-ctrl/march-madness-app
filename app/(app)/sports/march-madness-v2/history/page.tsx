"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export type BracketHistoryEntry = {
  seasonYear: number;
  score: number;
  champion: {
    name: string;
    logo_url: string;
    seed: number;
  };
  groupName: string | null;
  shareUrl?: string;
};

export default function BracketHistoryPanel({
  entries,
}: {
  entries: BracketHistoryEntry[];
}) {
  return (
    <div className="rounded-2xl bg-slate-950/70 border border-white/10 p-8 shadow-2xl backdrop-blur-md">
      {/* HEADER */}
      <h1 className="text-3xl font-extrabold text-yellow-400 tracking-tight drop-shadow-lg mb-6 text-center">
        Bracket History
      </h1>

      {entries.length === 0 && (
        <p className="text-center text-slate-400">
          No past brackets yet. Play this season to start your history!
        </p>
      )}

      <div className="flex flex-col gap-6">
        {entries.map((entry) => (
          <div
            key={entry.seasonYear}
            className="rounded-xl bg-slate-900/60 border border-white/10 p-6 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-6"
          >
            {/* LEFT SIDE */}
            <div className="flex items-center gap-6">
              {/* CHAMPION LOGO */}
              <div className="w-20 h-20 relative">
                <Image
                  src={entry.champion.logo_url}
                  alt={entry.champion.name}
                  fill
                  className="object-contain rounded-lg"
                />
              </div>

              {/* TEXT INFO */}
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white">
                  Season {entry.seasonYear}
                </span>

                <span className="text-yellow-400 font-semibold text-lg">
                  Champion: {entry.champion.name}
                </span>

                <span className="text-slate-400 text-sm">
                  Group: {entry.groupName || "None"}
                </span>

                <span className="text-slate-300 text-sm">
                  Score: {entry.score}
                </span>
              </div>
            </div>

            {/* RIGHT SIDE ACTIONS */}
            <div className="flex flex-col gap-3 text-center md:text-right">
              {/* SHARE BUTTON */}
              {entry.shareUrl && (
                <Link
                  href={entry.shareUrl}
                  className="px-4 py-2 rounded-lg bg-yellow-500 text-black font-bold hover:bg-yellow-400 transition"
                >
                  Share Image
                </Link>
              )}

              {/* VIEW BRACKET */}
              <Link
                href={`/sports/march-madness-v2/history/${entry.seasonYear}`}
                className="px-4 py-2 rounded-lg bg-slate-800 text-white border border-white/10 hover:bg-slate-700 transition"
              >
                View Bracket
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
