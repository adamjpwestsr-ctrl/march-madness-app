"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import {
  FaFootballBall,
  FaBaseballBall,
  FaGolfBall,
  FaUserCog,
  FaTools,
  FaChartLine,
  FaUsers,
  FaQuestionCircle,
  FaExclamationTriangle,
  FaBasketballBall,
  FaHockeyPuck,
  FaPhone,
} from "react-icons/fa";

import { createClient } from "@supabase/supabase-js";
import AdminSetCurrentTournament from "./components/AdminSetCurrentTournament"; // ⭐ NEW IMPORT

export default function AdminClient({ adminEmail }: { adminEmail: string }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // -----------------------------
  // Dynamic Stats State
  // -----------------------------
  const [stats, setStats] = useState({
    activeUsers: null as number | null,
    pendingUsers: null as number | null,
    openChallenges: null as number | null,
    totalPicks: null as number | null,
    activeSports: null as number | null,
    openReports: null as number | null,
  });

  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState(false);

  // -----------------------------
  // Fetch Stats
  // -----------------------------
  useEffect(() => {
    async function loadStats() {
      try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          .toISOString();
        const currentYear = now.getFullYear();

        // 1. Active Users (last 30 days)
        const { count: activeUsers } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .gte("last_login", thirtyDaysAgo);

        // 2. Pending Users
        const { count: pendingUsers } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending");

        // 3. Open Weekly Challenges
        const { count: openChallenges } = await supabase
          .from("sport_lock_times")
          .select("*", { count: "exact", head: true })
          .gt("lock_time", now.toISOString());

        // 4. Total Picks This Week
        const { count: totalPicks } = await supabase
          .from("weekly_picks")
          .select("*", { count: "exact", head: true })
          .eq("week_number", 1);

        // 5. Active Sports
        const { data: sportsData } = await supabase
          .from("sport_schedule")
          .select("sport")
          .eq("season_year", currentYear);

        const activeSports = sportsData
          ? new Set(sportsData.map((d) => d.sport)).size
          : 0;

        // 6. Open Forum Reports
        const { count: openReports } = await supabase
          .from("forum_reports")
          .select("*", { count: "exact", head: true })
          .eq("status", "open");

        setStats({
          activeUsers: activeUsers ?? 0,
          pendingUsers: pendingUsers ?? 0,
          openChallenges: openChallenges ?? 0,
          totalPicks: totalPicks ?? 0,
          activeSports: activeSports ?? 0,
          openReports: openReports ?? 0,
        });

        setLoadingStats(false);
      } catch (err) {
        console.error("Stats error:", err);
        setStatsError(true);
        setLoadingStats(false);
      }
    }

    loadStats();
  }, []);

  // -----------------------------
  // Search + Collapsible Sections
  // -----------------------------
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const sections = [
    {
      title: "Sports Management",
      icon: <FaFootballBall className="text-emerald-400 mr-2" />,
      tools: [
        { href: "/admin/golf/score-entry", label: "Golf Weekly — Score Entry", icon: <FaGolfBall /> },
        { href: "/admin/golf/tournament-metadata", label: "Golf Weekly — Tournament Metadata", icon: <FaGolfBall /> },
        { href: "/admin/mlb", label: "MLB Weekly Admin", icon: <FaBaseballBall /> },
        { href: "/admin/nfl-weekly", label: "NFL Weekly Admin", icon: <FaFootballBall /> },
        { href: "/admin/nba-weekly", label: "NBA Weekly Admin", icon: <FaBasketballBall /> },
        { href: "/admin/nhl-weekly", label: "NHL Weekly Admin", icon: <FaHockeyPuck /> },
        { href: "/admin/weekly-challenge", label: "Weekly Challenge Admin", icon: <FaChartLine /> },
        { href: "/admin/tournament-setup", label: "Tournament Setup", icon: <FaTools /> },
      ],
    },
    {
      title: "System Tools",
      icon: <FaTools className="text-sky-400 mr-2" />,
      tools: [
        { href: "/admin/leaderboard", label: "Leaderboard Tools", icon: <FaChartLine /> },
        { href: "/admin/scoring-audit", label: "Scoring Audit Log", icon: <FaTools /> },
        { href: "/admin/mulligans", label: "Mulligan Approvals", icon: <FaTools /> },
        { href: "/admin/snapshots", label: "Payout Snapshots", icon: <FaChartLine /> },
        { href: "/admin/import", label: "Season Import Tool", icon: <FaTools /> },
        { href: "/admin/notifications", label: "Push Notifications", icon: <FaPhone /> },
      ],
    },
    {
      title: "User & Forum Management",
      icon: <FaUsers className="text-indigo-400 mr-2" />,
      tools: [
        { href: "/admin/users", label: "User Management", icon: <FaUserCog /> },
        { href: "/admin/pending-users", label: "Pending Users", icon: <FaUsers /> },
        { href: "/admin/players", label: "Player Management", icon: <FaUserCog /> },
        { href: "/admin/forum", label: "Forum Moderation", icon: <FaQuestionCircle /> },
      ],
    },
    {
      title: "Miscellaneous",
      icon: <FaQuestionCircle className="text-yellow-400 mr-2" />,
      tools: [
        { href: "/admin/trivia", label: "Trivia Management", icon: <FaQuestionCircle /> },
        { href: "/admin/games", label: "Game Results", icon: <FaChartLine /> },
        { href: "/admin/brackets", label: "Bracket Management", icon: <FaTools /> },
        { href: "/admin/tools", label: "Bracket Tools & Simulations", icon: <FaTools /> },
        { href: "/sports", label: "Other Sports", icon: <FaFootballBall /> },
      ],
    },
  ];

  const filteredSections = useMemo(() => {
    if (!search.trim()) return sections;
    const term = search.toLowerCase();
    return sections
      .map((section) => ({
        ...section,
        tools: section.tools.filter((t) => t.label.toLowerCase().includes(term)),
      }))
      .filter((section) => section.tools.length > 0);
  }, [search]);

  const toggleCollapse = (title: string) => {
    setCollapsed((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-10 font-sans">
      <h1 className="text-4xl font-bold text-center mb-2">Admin Dashboard</h1>
      <p className="text-center mb-8 opacity-80 text-sm">
        Logged in as <strong>{adminEmail}</strong>
      </p>

      {/* -----------------------------
          Dynamic Stats Cards
      ------------------------------ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-6 max-w-6xl mx-auto mb-12">
        {[
          { label: "Active Users", value: stats.activeUsers, color: "text-sky-400" },
          { label: "Pending Users", value: stats.pendingUsers, color: "text-emerald-400" },
          { label: "Open Challenges", value: stats.openChallenges, color: "text-yellow-400" },
          { label: "Total Picks (Week)", value: stats.totalPicks, color: "text-indigo-400" },
          { label: "Active Sports", value: stats.activeSports, color: "text-pink-400" },
          { label: "Open Reports", value: stats.openReports, color: "text-red-400" },
        ].map((card, i) => (
          <div
            key={i}
            className="bg-slate-900 border border-slate-700 rounded-xl p-5 text-center"
          >
            <h3 className={`text-lg font-semibold ${card.color}`}>{card.label}</h3>
            {loadingStats ? (
              <div className="mt-3 h-6 bg-slate-700 animate-pulse rounded"></div>
            ) : statsError ? (
              <p className="text-red-400 mt-3">Error</p>
            ) : (
              <p className="text-2xl font-bold mt-2">{card.value}</p>
            )}
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto mb-10">
        <input
          type="text"
          placeholder="Search admin tools..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-sky-500"
        />
      </div>

      {/* ⭐ NEW: Set Current Tournament Tool */}
      <div className="max-w-3xl mx-auto mb-12">
        <AdminSetCurrentTournament />
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-10 max-w-5xl mx-auto">
        {filteredSections.map((section) => (
          <div key={section.title}>
            <button
              onClick={() => toggleCollapse(section.title)}
              className="flex items-center justify-between w-full text-left mb-4 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 hover:bg-slate-800 transition"
            >
              <div className="flex items-center">
                {section.icon}
                <span className="font-semibold text-lg">{section.title}</span>
              </div>
              <span className="text-slate-400 text-sm">
                {collapsed[section.title] ? "Show" : "Hide"}
              </span>
            </button>

            {!collapsed[section.title] && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.tools.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-center gap-2 bg-slate-800 border border-slate-700 rounded-lg p-4 text-center text-slate-200 font-semibold hover:bg-slate-700 hover:border-sky-500 transition"
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
