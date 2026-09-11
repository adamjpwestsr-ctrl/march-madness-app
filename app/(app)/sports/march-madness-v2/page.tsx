export default function Page() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center px-6 py-16">
      <div className="max-w-3xl w-full text-center">
        <h1 className="text-5xl font-extrabold text-yellow-400 drop-shadow-lg">
          March Madness V2
        </h1>

        <p className="mt-6 text-xl text-slate-300 leading-relaxed">
          Welcome to the next generation of BracketBoss — rebuilt from the ground up
          with live score syncing, smarter bracket logic, improved region mapping,
          and a brand‑new shareable champion image generator.
        </p>

        <div className="mt-10 bg-slate-800 border border-slate-700 rounded-xl p-8 shadow-xl">
          <h2 className="text-3xl font-bold text-yellow-300 mb-4">
            Build Your 2025 Bracket
          </h2>
          <p className="text-slate-300 mb-6">
            Start your bracket, follow live score updates, and generate a custom
            share image when your champion wins.
          </p>

          <a
            href="/sports/march-madness-v2/bracket"
            className="inline-block bg-yellow-400 text-slate-900 font-bold px-8 py-4 rounded-lg text-lg hover:bg-yellow-300 transition"
          >
            Start Your Bracket
          </a>
        </div>

        <div className="mt-16">
          <h3 className="text-2xl font-bold text-yellow-300 mb-4">
            What’s New in V2?
          </h3>

          <ul className="text-left text-slate-300 space-y-3 mx-auto max-w-xl">
            <li>• Fully reworked bracket engine with correct region/round mapping</li>
            <li>• Live Supabase score subscription</li>
            <li>• Cleaner, safer server-side logic</li>
            <li>• New PNG share-image generator powered by Sharp</li>
            <li>• Faster build times and production stability</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
