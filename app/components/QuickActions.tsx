"use client";

import Link from "next/link";
import { Trophy, Brain, Target, Star, ListChecks } from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      label: "Play Trivia",
      href: "/trivia",
      icon: <Brain size={18} />,
      accent: "text-sky-400",
    },
    {
      label: "Weekly Challenge",
      href: "/challenges",
      icon: <Target size={18} />,
      accent: "text-emerald-400",
    },
    {
      label: "Leaderboard",
      href: "/leaderboard",
      icon: <Trophy size={18} />,
      accent: "text-amber-400",
    },
    {
      label: "Your Picks",
      href: "/sports",
      icon: <Star size={18} />,
      accent: "text-fuchsia-400",
    },
    {
      label: "All Challenges",
      href: "/challenges",
      icon: <ListChecks size={18} />,
      accent: "text-emerald-300",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur p-4 shadow-lg">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {actions.map((a) => (
          <Link
            key={a.label}
            href={a.href}
            className="
              group flex flex-col items-center justify-center gap-2
              rounded-xl border border-white/5 bg-slate-900/60
              hover:border-emerald-500/40 hover:bg-slate-800/60
              transition-all duration-200 p-4 text-center
            "
          >
            <div className={`text-lg ${a.accent}`}>{a.icon}</div>
            <p className="text-xs text-slate-300 group-hover:text-white transition">
              {a.label}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
