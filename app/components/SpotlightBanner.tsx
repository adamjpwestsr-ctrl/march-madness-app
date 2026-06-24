"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function SpotlightBanner() {
  const today = new Date();
  const month = today.getMonth() + 1; // 1–12

  let spotlight = {
    title: "Welcome to BracketBoss",
    subtitle: "Your year‑round home for sports challenges.",
    href: "/challenges",
    accent: "text-emerald-400",
  };

  // Seasonal logic
  if (month === 3) {
    spotlight = {
      title: "March Madness is Here",
      subtitle: "Build your bracket and compete for the top spot.",
      href: "/sports/march-madness",
      accent: "text-fuchsia-400",
    };
  } else if (month >= 4 && month <= 9) {
    spotlight = {
      title: "MLB Weekly is Live",
      subtitle: "Pick your top hitter and track your streak.",
      href: "/sports/mlb",
      accent: "text-amber-400",
    };
  } else if (month === 10) {
    spotlight = {
      title: "NBA Season Tips Off",
      subtitle: "Make your weekly NBA picks.",
      href: "/sports/nba/weekly",
      accent: "text-sky-400",
    };
  } else if (month === 11) {
    spotlight = {
      title: "NFL Mid‑Season Push",
      subtitle: "Keep your weekly streak alive.",
      href: "/sports/nfl/weekly",
      accent: "text-red-400",
    };
  } else if (month === 12 || month === 1) {
    spotlight = {
      title: "NHL Winter Grind",
      subtitle: "Track your weekly NHL picks.",
      href: "/sports/nhl/weekly",
      accent: "text-blue-400",
    };
  }

  return (
    <Link
      href={spotlight.href}
      className="block rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur p-6 shadow-lg hover:bg-slate-800/40 transition"
    >
      <div className="flex items-center gap-3 mb-2">
        <Sparkles className={`${spotlight.accent}`} size={20} />
        <h2 className="text-lg font-semibold text-white">{spotlight.title}</h2>
      </div>

      <p className="text-slate-300 text-sm">{spotlight.subtitle}</p>
    </Link>
  );
}
