export const runtime = "edge";

const SPORTS = [
  {
    key: "nhl",
    icon: "🏒",
    name: "NHL Playoffs",
    description: "Best-of-7 series. Predict each round and follow the chase for the Cup.",
  },
  {
    key: "mlb",
    icon: "⚾",
    name: "MLB Postseason",
    description: "From Wild Card to World Series. Pick your October heroes.",
  },
  {
    key: "nfl",
    icon: "🏈",
    name: "NFL Playoffs",
    description: "Single-elimination. Any given Sunday becomes your bracket.",
  },
  {
    key: "cfp",
    icon: "🏆",
    name: "College Football Playoff",
    description: "12-team format. Win and advance on the biggest stage.",
  },
];

export default function SportsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Hero */}
      <header className="w-full px-6 sm:px-10 pt-10 pb-8">
        <div className="max-w-5xl mx-auto bg-white/5 border border-white/10 rounded-2xl px-6 sm:px-10 py-8 sm:py-10 shadow-xl shadow-black/40 backdrop-blur-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/40 mb-4">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold tracking-wide text-emerald-200">
              Platform Expansion
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-wide text-white">
            More Sports Coming Soon
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-200/80 max-w-2xl">
            Pick winners across multiple leagues — playoffs, championships, and more.
            March Madness is just the beginning.
          </p>

          <div className="mt-6 inline-flex items-center gap-3 text-xs text-slate-300">
            <span className="text-lg">🚧</span>
            <span className="uppercase tracking-[0.18em] text-slate-400">
              Under Construction
            </span>
          </div>
        </div>
      </header>

      {/* Sports Grid */}
      <main className="flex-1 w-full px-6 sm:px-10 pb-12">
        <div className="max-w-5xl mx-auto grid gap-6 sm:gap-7 md:grid-cols-2">
          {SPORTS.map((sport) => (
            <article
              key={sport.key}
              className="
                group relative overflow-hidden
                rounded-2xl bg-white/5 border border-white/10
                shadow-xl shadow-black/40 backdrop-blur-xl
                px-5 py-5 sm:px-6 sm:py-6
                flex flex-col gap-3
                transition-transform transition-shadow duration-200
                hover:shadow-[0_0_24px_rgba(16,185,129,0.45)]
                hover:border-emerald-400/60
                hover:-translate-y-[2px]
              "
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-900/70 flex items-center justify-center text-2xl">
                    {sport.icon}
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-white">
                      {sport.name}
                    </h2>
                    <span className="inline-flex items-center gap-1 mt-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-400/40 text-emerald-200 uppercase tracking-[0.16em]">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Coming Soon
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-200/85 mt-2">
                {sport.description}
              </p>

              <div className="mt-3 text-[11px] text-slate-400 italic">
                This mode will unlock in a future release.
              </div>
            </article>
          ))}
        </div>

        <div className="max-w-5xl mx-auto mt-10 text-center text-xs text-slate-500">
          More sports will be added throughout the year as formats and schedules are finalized.
        </div>
      </main>
    </div>
  );
}
