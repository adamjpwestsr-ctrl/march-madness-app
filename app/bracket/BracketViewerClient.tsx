// app/bracket/BracketViewerClient.tsx
"use client";

import { BracketView } from "./buildBracketView";

type Props = {
  view: BracketView;
};

export default function BracketViewerClient({ view }: Props) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-6">
      <header className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {view.bracketName || "Bracket"}
          </h1>
          <p className="text-slate-400 text-sm">
            By <span className="font-medium">{view.username}</span>
          </p>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700">
            <p className="text-slate-400 text-xs">Total Points</p>
            <p className="text-lg font-semibold">{view.totalPoints}</p>
          </div>
          {/* Placeholder for future max possible points */}
          <div className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700">
            <p className="text-slate-400 text-xs">Max Possible</p>
            <p className="text-lg font-semibold">
              {/* TODO: wire real max possible */}
              {view.totalPoints}
            </p>
          </div>
        </div>
      </header>

      <div className="overflow-x-auto">
        <div className="flex gap-6 min-w-max">
          {view.rounds.map((round) => (
            <div key={round.round} className="min-w-[220px]">
              <h2 className="text-sm font-semibold text-slate-300 mb-3 text-center">
                {round.label}
              </h2>
              <div className="flex flex-col gap-3">
                {round.games.map((g) => (
                  <div
                    key={g.gameId}
                    className="rounded-xl bg-slate-900/70 border border-slate-800 px-3 py-2 shadow-sm"
                  >
                    <p className="text-[11px] text-slate-500 mb-1">
                      {g.region || "Region"} · Game {g.gameId}
                    </p>

                    <div className="space-y-1">
                      {[g.team1, g.team2].map((team, idx) => {
                        const isPicked = team.isUserPick;
                        const isWinner = team.isWinner;
                        const isCorrect = team.isCorrect;

                        let bg = "bg-slate-900";
                        if (isCorrect === true && isPicked) {
                          bg = "bg-emerald-900/40";
                        } else if (isCorrect === false && isPicked) {
                          bg = "bg-rose-900/40";
                        }

                        return (
                          <div
                            key={idx}
                            className={`flex items-center justify-between gap-2 rounded-lg px-2 py-1 ${bg}`}
                          >
                            <div className="flex items-center gap-2">
                              {team.logoUrl ? (
                                <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={team.logoUrl}
                                    alt={team.name || ""}
                                    className="w-6 h-6 object-contain"
                                  />
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-300">
                                  {team.name
                                    ? team.name.slice(0, 2).toUpperCase()
                                    : "??"}
                                </div>
                              )}
                              <div>
                                <div className="text-xs font-medium">
                                  {team.name || "TBD"}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  Seed {team.seed ?? "-"}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col items-end text-[10px]">
                              {isPicked && (
                                <span className="px-2 py-0.5 rounded-full bg-sky-900/60 text-sky-200">
                                  Your Pick
                                </span>
                              )}
                              {isWinner && (
                                <span className="mt-1 px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-200">
                                  Winner
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span>
                        {g.winner
                          ? `Winner: ${g.winner}`
                          : "Awaiting result..."}
                      </span>
                      <span className="font-semibold text-sky-300">
                        +{g.pointsAwarded} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

