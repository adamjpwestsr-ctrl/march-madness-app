"use client";

import { useEffect, useState } from "react";
import { Trophy, Brain, Star, ArrowUp, ArrowDown } from "lucide-react";

type FeedItem = {
  id: string;
  type: "trivia" | "challenge" | "badge" | "leaderboard";
  title: string;
  detail: string;
  timestamp: string;
  change?: number; // for leaderboard movement
};

export default function ActivityFeed({ userId }: { userId: string }) {
  const [items, setItems] = useState<FeedItem[]>([]);

  useEffect(() => {
    // TODO: Replace with real DB activity feed
    // Mock data for now
    setItems([
      {
        id: "1",
        type: "trivia",
        title: "Trivia Completed",
        detail: "You scored 8/10 on today's trivia.",
        timestamp: "2 hours ago",
      },
      {
        id: "2",
        type: "challenge",
        title: "Weekly Pick Locked",
        detail: "You picked Scottie Scheffler for Golf Weekly.",
        timestamp: "5 hours ago",
      },
      {
        id: "3",
        type: "badge",
        title: "New Badge Earned",
        detail: "🔥 3‑Week Trivia Streak",
        timestamp: "1 day ago",
      },
      {
        id: "4",
        type: "leaderboard",
        title: "Leaderboard Movement",
        detail: "You climbed 4 spots this week.",
        timestamp: "2 days ago",
        change: +4,
      },
    ]);
  }, [userId]);

  const iconFor = (type: FeedItem["type"], change?: number) => {
    switch (type) {
      case "trivia":
        return <Brain size={18} className="text-sky-400" />;
      case "challenge":
        return <Star size={18} className="text-emerald-400" />;
      case "badge":
        return <Trophy size={18} className="text-amber-400" />;
      case "leaderboard":
        return change && change > 0 ? (
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
          <div
            key={item.id}
            className="flex items-start gap-3 rounded-xl bg-slate-800/40 border border-white/5 p-4 hover:bg-slate-800/60 transition"
          >
            <div className="mt-1">{iconFor(item.type, item.change)}</div>

            <div className="flex-1">
              <p className="text-sm font-medium text-white">{item.title}</p>
              <p className="text-xs text-slate-400">{item.detail}</p>
              <p className="text-[11px] text-slate-500 mt-1">{item.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
