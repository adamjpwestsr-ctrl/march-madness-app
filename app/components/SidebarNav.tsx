// app/components/SidebarNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  TrophyIcon,
  SparklesIcon,
  ChartBarIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

const navItems = [
  { href: "/home", label: "Home", icon: HomeIcon },
  { href: "/challenges", label: "Challenges", icon: TrophyIcon },
  { href: "/trivia", label: "Trivia", icon: SparklesIcon },
  { href: "/leaderboards", label: "Leaderboards", icon: ChartBarIcon },
  { href: "/settings", label: "Settings", icon: UserCircleIcon },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="h-full flex flex-col justify-between p-4">
      <div className="space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition
                ${
                  active
                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40"
                    : "text-slate-300 hover:bg-slate-800/70 hover:text-slate-50"
                }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Sponsor / footer area */}
      <div className="mt-6 pt-4 border-t border-slate-800">
        <div className="text-xs text-slate-500 mb-2">Sponsored by</div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-xs text-slate-300">
          <span className="font-semibold text-emerald-300">Your Brand Here</span>
          <span className="block text-slate-500">
            Non-intrusive sponsor placement.
          </span>
        </div>
      </div>
    </nav>
  );
}
