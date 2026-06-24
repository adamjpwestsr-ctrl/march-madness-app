"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Menu,
  X,
  Home,
  Trophy,
  Brain,
  ListChecks,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Star,
  Flag,
  Goal,
  Circle,
  CircleDot,
} from "lucide-react";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const [openChallenges, setOpenChallenges] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch("/logout", { method: "POST" });
    router.push("/login");
  };

  const link = (href: string, label: string, Icon: any) => (
    <Link
      href={href}
      onClick={() => setOpen(false)}
      className={`flex items-center gap-3 px-4 py-3 text-lg border-b border-slate-800 ${
        pathname === href ? "bg-slate-800 text-white" : "text-slate-300"
      }`}
    >
      <Icon size={20} />
      {label}
    </Link>
  );

  return (
    <>
      <button onClick={() => setOpen(true)}>
        <Menu size={28} />
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-64 bg-slate-900 z-50 transform transition-transform ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <span className="text-xl font-bold">Menu</span>
          <button onClick={() => setOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="flex flex-col">
          {link("/home", "Home", Home)}
          {link("/sports/march-madness", "March Madness", Trophy)}

          {/* Challenges (Expandable) */}
          <button
            onClick={() => setOpenChallenges(!openChallenges)}
            className="flex items-center gap-3 px-4 py-3 text-lg border-b border-slate-800 text-slate-200"
          >
            <ListChecks size={20} />
            Challenges
            {openChallenges ? (
              <ChevronDown size={18} className="ml-auto" />
            ) : (
              <ChevronRight size={18} className="ml-auto" />
            )}
          </button>

          <div
            className={`
              flex flex-col bg-slate-900/80
              overflow-hidden transition-all duration-300 ease-out
              ${openChallenges ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
            `}
          >
            {/* Hub */}
            <Link
              href="/challenges"
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2 px-8 py-2 text-base border-b border-slate-800 hover:bg-slate-800 ${
                pathname === "/challenges"
                  ? "bg-slate-800 text-white"
                  : "text-slate-300"
              }`}
            >
              <ListChecks size={16} />
              Challenges Hub
            </Link>

            {/* Golf Weekly */}
            <Link
              href="/sports/golf/weekly"
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2 px-8 py-2 text-base border-b border-slate-800 hover:bg-slate-800 ${
                pathname.startsWith("/sports/golf/weekly")
                  ? "bg-slate-800 text-white"
                  : "text-slate-300"
              }`}
            >
              <Flag size={16} />
              Golf Weekly
            </Link>

            {/* MLB Weekly */}
            <Link
              href="/sports/mlb"
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2 px-8 py-2 text-base border-b border-slate-800 hover:bg-slate-800 ${
                pathname.startsWith("/sports/mlb") &&
                !pathname.includes("/derby")
                  ? "bg-slate-800 text-white"
                  : "text-slate-300"
              }`}
            >
              <Circle size={16} />
              MLB Weekly
            </Link>

            {/* MLB Derby */}
            <Link
              href="/sports/mlb/derby"
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2 px-8 py-2 text-base border-b border-slate-800 hover:bg-slate-800 ${
                pathname.startsWith("/sports/mlb/derby")
                  ? "bg-slate-800 text-white"
                  : "text-slate-300"
              }`}
            >
              <Trophy size={16} />
              MLB Derby
            </Link>

            {/* NFL Weekly */}
            <Link
              href="/sports/nfl/weekly"
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2 px-8 py-2 text-base border-b border-slate-800 hover:bg-slate-800 ${
                pathname.startsWith("/sports/nfl/weekly")
                  ? "bg-slate-800 text-white"
                  : "text-slate-300"
              }`}
            >
              <Goal size={16} />
              NFL Weekly
            </Link>

            {/* NBA Weekly */}
            <Link
              href="/sports/nba/weekly"
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2 px-8 py-2 text-base border-b border-slate-800 hover:bg-slate-800 ${
                pathname.startsWith("/sports/nba/weekly")
                  ? "bg-slate-800 text-white"
                  : "text-slate-300"
              }`}
            >
              <CircleDot size={16} />
              NBA Weekly
            </Link>

            {/* NHL Weekly */}
            <Link
              href="/sports/nhl/weekly"
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2 px-8 py-2 text-base border-b border-slate-800 hover:bg-slate-800 ${
                pathname.startsWith("/sports/nhl/weekly")
                  ? "bg-slate-800 text-white"
                  : "text-slate-300"
              }`}
            >
              <Goal size={16} />
              NHL Weekly
            </Link>
          </div>

          {link("/trivia", "Trivia", Brain)}
          {link("/leaderboard", "Leaderboard", Trophy)}
          {link("/settings", "Settings", Settings)}

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-lg text-red-400 border-t border-slate-800"
          >
            <LogOut size={20} />
            Logout
          </button>
        </nav>
      </div>
    </>
  );
}
