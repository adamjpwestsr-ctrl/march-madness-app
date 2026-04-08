export const runtime = "edge";
export const dynamic = "force-dynamic";

import Link from "next/link";

export default function AdminOptionsPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-8 shadow-xl">

        {/* Title */}
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          Welcome, Admin
        </h1>

        <p className="text-slate-300 text-center mb-8">
          Choose where you want to go.
        </p>

        {/* Buttons */}
        <div className="space-y-4">

          <Link
            href="/bracket"
            className="
              block w-full text-center py-3 rounded-lg
              bg-emerald-600 text-white font-semibold
              hover:bg-emerald-500 hover:shadow-lg
              transition-all duration-200
            "
          >
            Enter Brackets
          </Link>

          <Link
            href="/leaderboard"
            className="
              block w-full text-center py-3 rounded-lg
              bg-slate-800 text-white font-semibold border border-slate-600
              hover:bg-slate-700 hover:shadow-lg
              transition-all duration-200
            "
          >
            Leaderboard
          </Link>

          <Link
            href="/admin"
            className="
              block w-full text-center py-3 rounded-lg
              bg-slate-800 text-white font-semibold border border-slate-600
              hover:bg-slate-700 hover:shadow-lg
              transition-all duration-200
            "
          >
            Admin Tools
          </Link>
        </div>

        {/* Back link */}
        <div className="mt-8 text-center">
          <Link
            href="/login"
            className="text-sm text-gray-400 underline hover:text-gray-300 transition"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
