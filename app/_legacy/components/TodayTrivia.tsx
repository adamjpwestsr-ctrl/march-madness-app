export default function TodayTrivia() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow">
      <h3 className="text-xl font-semibold mb-4">Today’s Trivia</h3>

      <div className="space-y-4">
        <p className="text-slate-300">
          Ready for a quick challenge? Answer today’s trivia question and earn points.
        </p>

        <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition">
          Play Now
        </button>
      </div>
    </div>
  );
}
