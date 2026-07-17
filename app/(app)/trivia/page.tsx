"use client";

export default function TriviaHub() {
  return (
    <div className="space-y-10 p-6">
      <section>
        <h1 className="text-3xl font-semibold mb-2">Trivia Hub (Minimal Test)</h1>
        <p className="text-slate-400">
          This is a stripped-down version used to isolate the crash.
        </p>
      </section>

      <section className="rounded-xl border border-slate-800 p-6 bg-slate-900/40 text-slate-300">
        <p>If you see this message, the page is stable.</p>
      </section>
    </div>
  );
}
