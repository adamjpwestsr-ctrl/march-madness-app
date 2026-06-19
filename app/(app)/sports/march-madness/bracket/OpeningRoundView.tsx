"use client";

import { OpeningRound } from "@/components/bracket/OpeningRound";
import { Game, Picks } from "@/lib/bracketTypes";

type OpeningRoundViewProps = {
  games: Game[];
  picks: Picks;
  isLocked: boolean;
  isSubmitted: boolean;
  onPick: (gameId: number, teamId: string) => void;
  onContinue: () => void;
};

export default function OpeningRoundView({
  games,
  picks,
  isLocked,
  isSubmitted,
  onPick,
  onContinue,
}: OpeningRoundViewProps) {
  // Group Opening Round games by region
  const regions = ["East", "West", "South", "Midwest"];

  const gamesByRegion = regions.map((region) => ({
    region,
    games: games.filter((g) => g.region === region),
  }));

  return (
    <div className="flex flex-col gap-8">
      {/* Title */}
      <h2 className="text-2xl font-bold text-slate-100">
        Opening Round Matchups
      </h2>

      {/* Region Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {gamesByRegion.map(({ region, games }) => (
          <div
            key={region}
            className="rounded-xl bg-slate-900/60 border border-slate-800 p-4 shadow-lg"
          >
            <h3 className="text-xl font-semibold mb-3 text-slate-200">
              {region} Region
            </h3>

            {games.length === 0 ? (
              <p className="text-slate-500 text-sm">No Opening Round games.</p>
            ) : (
              <OpeningRound
                games={games}
                picks={picks}
                mulligans={{ remaining: 0 }} // Opening Round does NOT use mulligans
                onPick={onPick}
                onUseMulligan={() => {}}
                isSubmitted={isSubmitted || isLocked}
              />
            )}
          </div>
        ))}
      </div>

      {/* Continue Button */}
      <div className="flex justify-center mt-6">
        <button
          type="button"
          onClick={onContinue}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md"
        >
          Continue to Regions
        </button>
      </div>
    </div>
  );
}

