"use client";

import { useEffect, useState, useRef } from "react";

type ForumPost = {
  id: string;
  email: string;
  message: string;
  thread_id: string | null;
  created_at: string;
};

const THREADS = [
  { id: null as string | null, label: "Main Chat" },
  // Future: add real thread IDs from DB
];

export default function ForumPanel() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [message, setMessage] = useState("");
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const loadPosts = async (threadId: string | null) => {
    const params = threadId ? `?threadId=${threadId}` : "";
    const res = await fetch(`/api/forum/posts${params}`, { cache: "no-store" });
    const json = await res.json();
    if (json.posts) {
      setPosts(json.posts);
      scrollToBottom();
    }
  };

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  };

  useEffect(() => {
    loadPosts(activeThreadId);
    // simple polling for Phase 1
    const id = setInterval(() => loadPosts(activeThreadId), 5000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeThreadId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/forum/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          threadId: activeThreadId,
        }),
      });
      if (res.ok) {
        setMessage("");
        await loadPosts(activeThreadId);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-lg">
      <div className="border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100">Pool Chat</h2>
        <div className="flex gap-2 text-xs">
          {THREADS.map((t) => (
            <button
              key={t.label}
              onClick={() => setActiveThreadId(t.id)}
              className={`px-2 py-1 rounded ${
                t.id === activeThreadId
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-sm">
        {posts.map((p) => {
          const name = p.email.split("@")[0];
          const time = new Date(p.created_at).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          });

          return (
            <div key={p.id} className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="font-semibold text-slate-200">{name}</span>
                <span>•</span>
                <span>{time}</span>
              </div>
              <div className="text-slate-100">{p.message}</div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-slate-800 px-4 py-3 flex gap-2"
      >
        <input
          className="flex-1 bg-slate-800 text-slate-100 text-sm rounded px-3 py-2 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Talk trash, celebrate, meltdown..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !message.trim()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded text-sm font-semibold text-white"
        >
          Send
        </button>
      </form>
    </div>
  );
}
