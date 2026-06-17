"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });

    if (error) {
      setError("Something went wrong.");
      return;
    }

    router.push("/welcome-name");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[url('/background-icons.png')] bg-cover bg-center text-white"
    >
      <div className="relative bg-[#0b1220] p-8 rounded-2xl border border-emerald-700 shadow-[0_0_25px_5px_rgba(16,185,129,0.4)] w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="text-xs text-emerald-400 font-semibold">NEW: Trivia Blitz</div>
          <h1 className="text-2xl font-bold">Welcome to BracketBoss</h1>
          <p className="text-emerald-300 text-sm">Play Sports Trivia Blitz</p>
          <p className="text-slate-400 text-xs">Your sports. Your picks. Your glory.</p>
        </div>

        <form onSubmit={handleContinue} className="space-y-4">
          <label className="block text-sm font-medium text-slate-300">
            Enter your email
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-emerald-600 py-2 rounded-lg hover:bg-emerald-500 font-semibold"
          >
            Continue
          </button>
        </form>

        <div className="flex justify-between text-xs text-slate-400 pt-2">
          <a href="/about" className="hover:text-emerald-400">About BracketBoss</a>
          <a href="mailto:commissioners@bracketboss.com" className="hover:text-emerald-400">
            Email the Commissioners
          </a>
        </div>
      </div>
    </div>
  );
}
