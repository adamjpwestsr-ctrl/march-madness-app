"use client";

import { useState } from "react";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [showAbout, setShowAbout] = useState(false);

  return (
    <div
      className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat flex items-center justify-center"
      style={{ backgroundImage: "url('/background-bracket.png')" }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* Login Card */}
      <div className="relative z-10 bg-slate-900 bg-opacity-90 p-10 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700">
        
        {/* Title */}
        <h1 className="text-white text-4xl font-extrabold text-center drop-shadow-lg mb-4">
          Welcome Back
        </h1>

        {/* Tagline */}
        <p className="text-slate-300 text-center mb-8 text-sm">
          Enter your email. Build your brackets. <span className="text-emerald-400 font-semibold">Chase the glory.</span>
        </p>

        {/* Label + About Link */}
        <div className="flex justify-between items-center w-full mb-2">
          <label className="text-white text-lg font-semibold">
            Enter your email
          </label>

          <button
            onClick={() => setShowAbout(true)}
            className="text-emerald-400 text-sm hover:text-emerald-300 underline"
          >
            About Our Bracket Challenge
          </button>
        </div>

        {/* Email Input */}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />

        {/* Submit Button */}
        <button
          className="mt-6 w-full bg-emerald-500 py-3 rounded-lg text-white font-bold hover:bg-emerald-400 transition"
        >
          Continue
        </button>
      </div>

"use client";

import { useState } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  const [showAbout, setShowAbout] = useState(false);

  return (
    <div
      className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat flex items-center justify-center"
      style={{ backgroundImage: "url('/background-bracket.png')" }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* Login Card */}
      <div className="relative z-10 bg-slate-900 bg-opacity-90 p-10 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700">
        
        {/* Title */}
        <h1 className="text-white text-4xl font-extrabold text-center drop-shadow-lg mb-4">
          Welcome Back
        </h1>

        {/* Tagline */}
        <p className="text-slate-300 text-center mb-8 text-sm">
          Enter your email. Build your brackets.{" "}
          <span className="text-emerald-400 font-semibold">Chase the glory.</span>
        </p>

        {/* Label + About Link */}
        <div className="flex justify-between items-center w-full mb-2">
          <label className="text-white text-lg font-semibold">
            Enter your email
          </label>

          <button
            onClick={() => setShowAbout(true)}
            className="text-emerald-400 text-sm hover:text-emerald-300 underline"
          >
            About Our Bracket Challenge
          </button>
        </div>

        {/* EMBEDDED LOGIN FORM (keeps your full login logic working) */}
        <LoginForm />
      </div>

            {/* ABOUT MODAL */}
      {showAbout && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-xl max-w-lg w-full text-white shadow-xl border border-slate-700">
            <h2 className="text-2xl font-bold mb-4">About Our Bracket Challenge</h2>

            <ul className="space-y-3 text-sm leading-relaxed">
              <li>
                <strong>Multiple Brackets:</strong> You can create up to 5 brackets and all you need is your email!
              </li>
              <li>
                <strong>Leaderboard:</strong> After submitting, visit the leaderboard anytime to see how you stack up.
              </li>
              <li>
                <strong>Sign‑In:</strong> Your email is your key — no password needed. If you're new, the admin approves your entry.
              </li>
              <li>
                <strong>Mulligans:</strong> Each player gets two mulligans — you can “undo” your pick if your pick loses in the first 2 rounds.
              </li>
              <li>
                <strong>Prizes:</strong> Top finishers win bragging rights and money, because some times money is better than bragging rights.
              </li>
            </ul>

         <button
              onClick={() => setShowAbout(false)}
              className="mt-6 w-full bg-emerald-500 py-2 rounded-lg hover:bg-emerald-400"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

            <button
              onClick={() => setShowAbout(false)}
              className="mt-6 w-full bg-emerald-500 py-2 rounded-lg hover:bg-emerald-400"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
