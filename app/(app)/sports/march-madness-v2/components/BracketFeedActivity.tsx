"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import FeedItemAnimation from "../fx/FeedItemAnimation";

export type FeedItem = {
  id: string;
  type: "pick" | "score" | "win" | "loss";
  timestamp: string;
  userName: string;
  teamName?: string;
  teamLogo?: string;
  points?: number;
};

export default function BracketFeedActivity({ items }: { items: FeedItem[] }) {
  const feedRef = useRef<HTMLDivElement>(null);
  const prevCount = useRef(items.length);

  useEffect(() => {
    const container = feedRef.current;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      120;

    const newItemsAdded = items.length > prevCount.current;
    prevCount.current = items.length;

    if (newItemsAdded && isNearBottom) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [items]);

  return (
    <div className="rounded-2xl bg-slate-950/70 border border-white/10 p-6 shadow-xl backdrop-blur-md">
      <h2 className="text-2xl font-bold text-yellow-400 mb-4">Activity Feed</h2>

      {items.length === 0 && (
        <p className="text-slate-400 text-center">No activity yet.</p>
      )}

      <div
        ref={feedRef}
        className="flex flex-col gap-4 max-h-[420px] overflow-y-auto pr-2"
      >
        {items.map((item) => (
          <FeedItemAnimation key={item.id} type={item.type}>
            <div className="flex items-center gap-4 bg-slate-900/60 p-4 rounded-xl border border-white/10">
              {item.teamLogo && (
                <Image
                  src={item.teamLogo}
                  alt={item.teamName || ""}
                  width={48}
                  height={48}
                  className="rounded-lg"
                />
              )}

              <div className="flex flex-col">
                <span className="text-white font-semibold">
                  {item.userName}
                </span>

                <span className="text-slate-300 text-sm">
                  {item.type === "pick" && `Picked ${item.teamName}`}
                  {item.type === "win" && `${item.teamName} won`}
                  {item.type === "loss" && `${item.teamName} lost`}
                  {item.type === "score" &&
                    `Score updated: +${item.points} points`}
                </span>

                <span className="text-slate-500 text-xs">
                  {new Date(item.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          </FeedItemAnimation>
        ))}
      </div>
    </div>
  );
}
