"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  Trophy,
  Brain,
  ListChecks,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Flag,
  Goal,
  Circle,
  CircleDot,
} from "lucide-react";

export default function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [openChallenges, setOpenChallenges] = useState(false);

  const handleLogout = async () => {
    await fetch("/logout", { method: "POST" });
    router.push("/login");
  };

  const link = (href: string, label: string, Icon: any) => (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-2 rounded-md hover:bg-slate-800 transition-all duration-300 ${
        pathname === href ? "bg-slate-800 text-white" : "text-slate-300"
      }`}
    >
      <Icon size={18} />
      <span className="hidden group-hover:inline-block">{label}</span>
    </Link>
  );

  return (
    <nav className="flex flex-col gap-2 p-4 w-64 lg:w-16 group-hover:w-64 transition-all duration-300 ease-in-out overflow-hidden group">
      {link("/home", "Home", Home)}

      {link("/sports/march-madness", "March Madness", Trophy)}

      {/* Challenges */}
      <button
        onClick={() => setOpenChallenges(!openChallenges)}
        className="flex items-center gap-3 px-4 py-2 rounded-md text-slate-300 hover:bg-slate-800 transition-all duration-300"
      >
        <ListChecks size={18} />
        <span className="hidden group-hover:inline-block">Challenges</span>
        {openChallenges ? (
          <ChevronDown size={16} className="ml-auto hidden group-hover:inline-block" />
        ) : (
          <ChevronRight size={16} className="ml-auto hidden group-hover:inline-block" />
        )}
      </button>

      <div
        className={`
          ml-8 flex flex-col gap-1 overflow-hidden transition-all duration-300 ease-out
          ${openChallenges ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <Link
          href="/challenges"
          className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm hover:bg-slate-800 transition-all duration-300 ${
            pathname === "/challenges" ? "bg-slate-800 text-white" : "text-slate-400"
          }`}
        >
          <ListChecks size={16} />
          <span className="hidden group-hover:inline-block">Challenges Hub</span>
        </Link>

        <Link
          href="/sports/golf/weekly"
          className="flex items-center gap-2 px-3 py-1 text-sm text-slate-400 hover:bg-slate-800 rounded-md transition-all duration-300"
        >
          <Flag size={16} />
          <span className="hidden group-hover:inline-block">Golf Weekly</span>
        </Link>

        <Link
          href="/sports/mlb"
          className="flex items-center gap-2 px-3 py-1 text-sm text-slate-400 hover:bg-slate-800 rounded-md transition-all duration-300"
        >
          <Circle size={16} />
          <span className="hidden group-hover:inline-block">MLB Weekly</span>
        </Link>

        <Link
          href="/sports/mlb/derby"
          className="flex items-center gap-2 px-3 py-1 text-sm text-slate-400 hover:bg-slate-800 rounded-md transition-all duration-300"
        >
          <Trophy size={16} />
          <span className="hidden group-hover:inline-block">MLB Derby</span>
        </Link>

        <Link
          href="/sports/nfl/weekly"
          className="flex items-center gap-2 px-3 py-1 text-sm text-slate-400 hover:bg-slate-800 rounded-md transition-all duration-300"
        >
          <Goal size={16} />
          <span className="hidden group-hover:inline-block">NFL Weekly</span>
        </Link>

        <Link
          href="/sports/nba/weekly"
          className="flex items-center gap-2 px-3 py-1 text-sm text-slate-400 hover:bg-slate-800 rounded-md transition-all duration-300"
        >
          <CircleDot size={16} />
          <span className="hidden group-hover:inline-block">NBA Weekly</span>
        </Link>

        <Link
          href="/sports/nhl/weekly"
          className="flex items-center gap-2 px-3 py-1 text-sm text-slate-400 hover:bg-slate-800 rounded-md transition-all duration-300"
        >
          <Goal size={16} />
          <span className="hidden group-hover:inline-block">NHL Weekly</span>
        </Link>

        <Link
          href="/sports/nascar"
          className="flex items-center gap-2 px-3 py-1 text-sm text-slate-400 hover:bg-slate-800 rounded-md transition-all duration-300"
        >
          <Flag size={16} />
          <span className="hidden group-hover:inline-block">NASCAR Weekly</span>
        </Link>
      </div>

      {link("/trivia", "Trivia", Brain)}
      {link("/leaderboard", "Leaderboard", Trophy)}
      {link("/settings", "Settings", Settings)}

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-2 rounded-md text-red-400 hover:bg-slate-800 hover:text-red-300 transition-all duration-300"
      >
        <LogOut size={18} />
        <span className="hidden group-hover:inline-block">Logout</span>
      </button>
    </nav>
  );
}
