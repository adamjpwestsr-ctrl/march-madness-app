//app/(app0/sports/f1/page.tsx
export const dynamic = "force-dynamic";

export default function F1LandingPage() {
  return (
    <div className="space-y-10 pb-20 max-w-4xl mx-auto px-4">

      {/* Header */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <h1 className="text-3xl font-bold text-white mb-2">🏎️ Formula 1 Challenge</h1>
        <p className="text-slate-400 text-lg">
          Welcome to the F1 Challenge hub. This page is a test to confirm routing.
        </p>
      </section>

      {/* Placeholder */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="text-xl font-semibold text-white mb-2">Coming Soon</h2>
        <p className="text-slate-400">
          F1 weekly picks, race predictions, and leaderboard features will appear here.
        </p>
      </section>

    </div>
  );
}
