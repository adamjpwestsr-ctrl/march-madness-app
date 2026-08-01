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
  const [openSport, setOpenSport] = useState<string | null>(null);

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

  const sportSection = (
    sportId: string,
    sportLabel: string,
    Icon: any,
    challenges: { title: string; href: string }[]
  ) => (
    <div>
      <button
        onClick={() => setOpenSport(openSport === sportId ? null : sportId)}
        className="flex items-center gap-3 px-3 py-1 text-sm text-slate-400 hover:bg-slate-800 rounded-md w-full"
      >
        <Icon size={16} />
        {sportLabel}
        {openSport === sportId ? (
          <ChevronDown size={14} className="ml-auto" />
        ) : (
          <ChevronRight size={14} className="ml-auto" />
        )}
      </button>

      <div
        className={`ml-6 flex flex-col gap-1 transition-all duration-300 ${
          openSport === sportId ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {challenges.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm hover:bg-slate-800 ${
              pathname === c.href ? "bg-slate-800 text-white" : "text-slate-400"
            }`}
          >
            <Circle size={14} />
            {c.title}
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <nav className="flex flex-col gap-2 p-4">
      {link("/home", "Home", Home)}
      {link("/sports/march-madness", "March Madness", Trophy)}

      {/* CHALLENGES ROOT */}
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

      {/* CHALLENGES DROPDOWN */}
      <div
        className={`ml-8 flex flex-col gap-2 transition-all duration-300 ${
          openChallenges ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {/* HUB */}
        <Link
          href="/challenges"
          className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm hover:bg-slate-800 ${
            pathname === "/challenges" ? "bg-slate-800 text-white" : "text-slate-400"
          }`}
        >
          <ListChecks size={16} />
          Challenge Overload
        </Link>

        {/* GOLF */}
        {sportSection("golf", "Golf", Flag, [
          { title: "Golf Weekly", href: "/sports/golf/weekly" },
        ])}

        {/* MLB */}
        {sportSection("mlb", "MLB", Circle, [
          { title: "MLB Weekly", href: "/sports/mlb/weekly" },
          { title: "MLB Homerun Derby", href: "/sports/mlb/derby" },
        ])}

        {/* NFL */}
        {sportSection("nfl", "NFL", Goal, [
          { title: "NFL Weekly", href: "/sports/nfl/weekly" },
        ])}

        {/* NBA */}
        {sportSection("nba", "NBA", CircleDot, [
          { title: "NBA Weekly", href: "/sports/nba/weekly" },
        ])}

        {/* NHL */}
        {sportSection("nhl", "NHL", Goal, [
          { title: "NHL Weekly", href: "/sports/nhl/weekly" },
        ])}

        {/* NCAAF */}
        {sportSection("ncaaf", "NCAA Football", Goal, [
          { title: "NCAAF Weekly", href: "/sports/ncaaf" },
        ])}

        {/* RACING */}
        {sportSection("racing", "Racing", Flag, [
          { title: "NASCAR Race Day", href: "/sports/nascar/" },
          { title: "F1 Race Day", href: "/sports/f1/" },
        ])}
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
