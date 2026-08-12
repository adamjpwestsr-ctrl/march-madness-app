"use client";

import { useEffect, useState } from "react";

export interface QueueItem {
  player_id: number;
  rank: number;
}

export function useDraftQueue() {
  const [queue, setQueue] = useState<QueueItem[]>([]);

  const loadQueue = async () => {
    const res = await fetch("/api/fantasy/queue/get");
    const json = await res.json();
    setQueue(json.queue || []);
  };

  const addToQueue = async (playerId: number) => {
    await fetch("/api/fantasy/queue/add", {
      method: "POST",
      body: JSON.stringify({ playerId }),
    });
    loadQueue();
  };

  const removeFromQueue = async (playerId: number) => {
    await fetch("/api/fantasy/queue/remove", {
      method: "POST",
      body: JSON.stringify({ playerId }),
    });
    loadQueue();
  };

  const clearQueue = async () => {
    await fetch("/api/fantasy/queue/clear", { method: "POST" });
    loadQueue();
  };

  // ⭐ Step 2: Update rank
  const updateRank = async (playerId: number, rank: number) => {
    await fetch("/api/fantasy/queue/update-rank", {
      method: "POST",
      body: JSON.stringify({ playerId, rank }),
    });
    loadQueue();
  };

  useEffect(() => {
    loadQueue();
  }, []);

  return { queue, addToQueue, removeFromQueue, clearQueue, updateRank };
}
