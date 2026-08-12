"use client";

import { useEffect, useState } from "react";

export function useDraftQueue() {
  const [queue, setQueue] = useState([]);

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

  useEffect(() => {
    loadQueue();
  }, []);

  return { queue, addToQueue, removeFromQueue, clearQueue };
}
