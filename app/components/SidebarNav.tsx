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
      className={`flex items-center gap-3 px-4 py-2 rounded-md hover:bg-slate-800 ${
        pathname === href ? "bg-slate-800 text-white" : "text-slate-300"
      }`}
    >
      <Icon size={18} />
      {label}
    </Link>
  );

  return (
    <nav className="flex flex-col gap-2 p-4">
      {link("/home", "Home", Home)}

      {/* March Madness */}
      {link("/sports/march-madness", "March Madness", Trophy)}

      {/* Challenges (Expandable) */}
      <button
        onClick={() => setOpenChallenges(!openChallenges)}
        className="flex items-center gap-3 px-4 py-2 rounded-md text-slate-300 hover:bg-slate-800"
      >
        <ListChecks size={18} />
        Challenges
        {openChallenges ? (
          <ChevronDown size={16} className="ml-auto" />
        ) : (
          <ChevronRight size={16} className="ml-auto" />
        )}
      </button>

      <div
        className={`
          ml-8 flex flex-col gap-1
          overflow-hidden transition-all duration-300 ease-out
          ${openChallenges ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        {/* Hub */}
        <Link
          href="/challenges"
          className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm hover:bg-slate-800 ${
            pathname === "/challenges" ? "bg-slate-800 text-white" : "text-slate-400"
          }`}
        >
          <ListChecks size={16} />
          Challenges Hub
        </Link>

        {/* Weekly Challenges */}
        <Link
          href="/sports/golf/weekly"
          className="flex items-center gap-2 px-3 py-1 text-sm text-slate-400 hover:bg-slate-800 rounded-md"
        >
          <Flag size={16} />
          Golf Weekly
        </Link>

        <Link
          href="/sports/mlb"
          className="flex items-center gap-2 px-3 py-1 text-sm text-slate-400 hover:bg-slate-800 rounded-md"
        >
          <Circle size={16} />
          MLB Weekly
        </Link>

        <Link
          href="/sports/mlb/derby"
          className="flex items-center gap-2 px-3 py-1 text-sm text-slate-400 hover:bg-slate-800 rounded-md"
        >
          <Trophy size={16} />
          MLB Derby
        </Link>

        <Link
          href="/sports/nfl/weekly"
          className="flex items-center gap-2 px-3 py-1 text-sm text-slate-400 hover:bg-slate-800 rounded-md"
        >
          <Goal size={16} />
          NFL Weekly
        </Link>

        <Link
          href="/sports/nba/weekly"
          className="flex items-center gap-2 px-3 py-1 text-sm text-slate-400 hover:bg-slate-800 rounded-md"
        >
          <CircleDot size={16} />
          NBA Weekly
        </Link>

        <Link
          href="/sports/nhl/weekly"
          className="flex items-center gap-2 px-3 py-1 text-sm text-slate-400 hover:bg-slate-800 rounded-md"
        >
          <Goal size={16} />
          NHL Weekly
        </Link>

        {/* ⭐ NASCAR Weekly */}
        <Link
          href="/sports/nascar"
          className="flex items-center gap-2 px-3 py-1 text-sm text-slate-400 hover:bg-slate-800 rounded-md"
        >
          <Flag size={16} />
          NASCAR Weekly
        </Link>
      </div>

      {link("/trivia", "Trivia", Brain)}
      {link("/leaderboard", "Leaderboard", Trophy)}
      {link("/settings", "Settings", Settings)}

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-2 rounded-md text-red-400 hover:bg-slate-800 hover:text-red-300"
      >
        <LogOut size={18} />
        Logout
      </button>
    </nav>
  );
}
 