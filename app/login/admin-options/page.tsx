"use client";

export default function AdminOptionsPage() {
  return (
    <div
      className="
        relative min-h-screen w-full bg-cover bg-center bg-no-repeat 
        flex items-center justify-center
      "
      style={{ backgroundImage: "url('/background-bracket.png')" }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* Card */}
      <div
        className="
          relative z-10 bg-slate-900 bg-opacity-90 
          p-10 rounded-2xl shadow-2xl w-full max-w-md 
          border border-slate-700
        "
      >
        <h1 className="text-white text-3xl font-extrabold text-center drop-shadow-lg mb-4">
          Admin Options
        </h1>

        <p className="text-slate-300 text-center mb-8 text-sm">
          Choose where you want to go.{" "}
          <span className="text-emerald-400 font-semibold">You’re in control.</span>
        </p>

        <div className="space-y-4">

          {/* Brackets */}
          <button
            onClick={() => (window.location.href = "/bracket")}
            className="
              w-full bg-emerald-600 text-white py-2 rounded-lg
              hover:bg-emerald-500 hover:shadow-lg
              transition-all duration-200
            "
          >
            Brackets (March Madness)
          </button>

          {/* Leaderboard */}
          <button
            onClick={() => (window.location.href = "/leaderboard")}
            className="
              w-full bg-white/10 border border-white/20 text-white py-2 rounded-lg
              hover:bg-white/20 transition-all duration-200
            "
          >
            Leaderboard
          </button>

          {/* Other Sports */}
          <button
            onClick={() => (window.location.href = "/sports")}
            className="
              w-full bg-white/10 border border-white/20 text-white py-2 rounded-lg
              hover:bg-white/20 transition-all duration-200
            "
          >
            Other Sports
          </button>

          {/* Admin Tools (RESTORED) */}
          <button
            onClick={() => (window.location.href = "/admin")}
            className="
              w-full bg-white/10 border border-white/20 text-white py-2 rounded-lg
              hover:bg-white/20 transition-all duration-200
            "
          >
            Admin Tools
          </button>

          {/* Back to Login */}
          <button
            onClick={() => (window.location.href = "/login")}
            className="w-full text-sm text-gray-400 underline mt-2"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
