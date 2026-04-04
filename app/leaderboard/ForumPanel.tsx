"use client";

import { useEffect, useState, useRef } from "react";

type ForumReaction = {
  emoji: string;
  email: string;
};

type ForumPost = {
  id: string;
  email: string;
  message: string;
  thread_id: string | null;
  created_at: string;
  forum_reactions?: ForumReaction[];
};

type ForumThread = {
  id: string;
  title: string;
  created_by: string;
  created_at: string;
};

export default function ForumPanel() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [message, setMessage] = useState("");
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showThreadModal, setShowThreadModal] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const loadThreads = async () => {
    const res = await fetch("/api/forum/threads", { cache: "no-store" });
    const json = await res.json();
    if (json.threads) {
      setThreads(json.threads);
    }
  };

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
    loadThreads();
  }, []);

  useEffect(() => {
    loadPosts(activeThreadId);
    const id = setInterval(() => loadPosts(activeThreadId), 5000);
    return () => clearInterval(id);
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

  const handleReaction = async (postId: string, emoji: string) => {
    await fetch("/api/forum/reactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, emoji }),
    });

    await loadPosts(activeThreadId);
  };

  const createThread = async () => {
    if (!newThreadTitle.trim()) return;

    const res = await fetch("/api/forum/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newThreadTitle }),
    });

    const json = await res.json();
    if (json.thread) {
      setShowThreadModal(false);
      setNewThreadTitle("");
      await loadThreads();
      setActiveThreadId(json.thread.id);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-lg">

      {/* HEADER */}
      <div className="border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100">Pool Chat</h2>

        <div className="flex gap-2 text-xs">
          <button
            onClick={() => setActiveThreadId(null)}
            className={`px-2 py-1 rounded ${
              activeThreadId === null
                ? "bg-blue-600 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Main Chat
          </button>

          {threads.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveThreadId(t.id)}
              className={`px-2 py-1 rounded ${
                t.id === activeThreadId
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {t.title}
            </button>
          ))}

          <button
            onClick={() => setShowThreadModal(true)}
            className="px-2 py-1 rounded bg-green-600 text-white hover:bg-green-700"
          >
            + New Thread
          </button>
        </div>
      </div>

      {/* POSTS */}
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

              {/* REACTIONS */}
              <div className="flex gap-2 mt-1">
                {["🔥", "😂", "😭", "🏀"].map((emoji) => {
                  const count =
                    p.forum_reactions?.filter((r) => r.emoji === emoji).length ||
                    0;

                  const userReacted = p.forum_reactions?.some(
                    (r) => r.emoji === emoji && r.email === p.email
                  );

                  return (
                    <button
                      key={emoji}
                      onClick={() => handleReaction(p.id, emoji)}
                      className={`px-2 py-1 rounded text-xs border ${
                        userReacted
                          ? "bg-blue-600 border-blue-500 text-white"
                          : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      {emoji} {count > 0 && <span className="ml-1">{count}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
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

      {/* THREAD CREATION MODAL */}
      {showThreadModal && (
        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="bg-slate-800 p-6 rounded-lg w-80 space-y-4 border border-slate-700">
            <h3 className="text-lg font-semibold text-slate-100">New Thread</h3>

            <input
              className="w-full bg-slate-900 text-slate-100 rounded px-3 py-2 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Thread title..."
              value={newThreadTitle}
              onChange={(e) => setNewThreadTitle(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowThreadModal(false)}
                className="px-3 py-2 bg-slate-700 text-slate-300 rounded hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={createThread}
                className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
