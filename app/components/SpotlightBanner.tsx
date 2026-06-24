"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function SpotlightBanner() {
  // TODO: Replace with seasonal logic or Supabase CMS
  const spotlight = {
    title: "March Madness is Coming",
    subtitle: "Build your bracket and compete for the top spot.",
    href: "/sports/march-madness",
    accent: "text-emerald-400",
  };

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
