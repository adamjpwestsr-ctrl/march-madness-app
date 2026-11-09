
import Link from "next/link";
import BracketHelpContent from "@/components/march-madness/BracketHelpContent";

export default function MarchMadnessHelpPage() {
  return (
    <main className="min-h-screen bg-[#080f20] px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-4xl">

        <div className="mb-8 flex items-center justify-between gap-3">
          <Link
            href="/sports/march-madness-v2"
            className="text-sm font-bold text-cyan-300 transition hover:text-white"
          >
            ← Back to Hub
          </Link>

          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            BracketBoss Intelligence
          </span>
        </div>

        <div className="mb-8 text-center">
          <div className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300">
            The Official Guide
          </div>

          <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
            How to Play
          </h1>

          <p className="mt-3 text-sm text-slate-400">
            Everything you need to know about the Bracket Busters
            March Madness Challenge.
          </p>
        </div>

        <BracketHelpContent />

        <footer className="mt-10 border-t border-slate-800 py-6 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
            Where Madness Meets Mastery
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Presented by BracketBoss
          </p>
        </footer>

      </div>
    </main>
  );
}
