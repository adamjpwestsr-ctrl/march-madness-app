"use client";

import { useEffect, useState } from "react";
import { Trophy, Brain, Star, ArrowUp, ArrowDown } from "lucide-react";
import Link from "next/link";

type ActivityItem = {
  id: string;
  type: "trivia" | "weekly" | "badge" | "leaderboard";
  title: string;
  detail: string;
  timestamp: string;
  change?: number;
  href?: string;
};

export default function RealActivityFeed({ userId }: { userId: string }) {
  const [items, setItems] = useState<ActivityItem[]>([]);

  useEffect(() => {
    async function load() {
      // TODO: Replace with Supabase queries
      // Example structure for real data:
      // const { data } = await supabase.from("activity").select("*").eq("user_id", userId);

      setItems([
        {
          id: "1",
          type: "trivia",
          title: "Trivia Completed",
          detail: "You scored 9/10 on today’s trivia.",
          timestamp: "1 hour ago",
          href: "/trivia",
        },
        {
          id: "2",
          type: "weekly",
          title: "Weekly Pick Submitted",
          detail: "You picked Scottie Scheffler for Golf Weekly.",
          timestamp: "3 hours ago",
          href: "/challenges",
        },
        {
          id: "3",
          type: "badge",
          title: "New Badge Earned",
          detail: "🔥 Trivia Streak: 4 Days",
          timestamp: "1 day ago",
          href: "/profile",
        },
        {
          id: "4",
          type: "leaderboard",
          title: "Leaderboard Movement",
          detail: "You climbed 6 spots this week.",
          timestamp: "2 days ago",
          change: +6,
          href: "/leaderboard",
        },
      ]);
    }

    load();
  }, [userId]);

  const iconFor = (item: ActivityItem) => {
    switch (item.type) {
      case "trivia":
        return <Brain size={18} className="text-sky-400" />;
      case "weekly":
        return <Star size={18} className="text-emerald-400" />;
      case "badge":
        return <Trophy size={18} className="text-amber-400" />;
      case "leaderboard":
        return item.change && item.change > 0 ? (
          <ArrowUp size={18} className="text-emerald-400" />
        ) : (
          <ArrowDown size={18} className="text-red-400" />
        );
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur p-5 shadow-lg space-y-4">
      <h2 className="text-lg font-semibold text-white">Recent Activity</h2>

      <div className="space-y-4">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href || "#"}
            className="flex items-start gap-3 rounded-xl bg-slate-800/40 border border-white/5 p-4 hover:bg-slate-800/60 transition"
          >
            <div className="mt-1">{iconFor(item)}</div>

            <div className="flex-1">
              <p className="text-sm font-medium text-white">{item.title}</p>
              <p className="text-xs text-slate-400">{item.detail}</p>
              <p className="text-[11px] text-slate-500 mt-1">{item.timestamp}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
