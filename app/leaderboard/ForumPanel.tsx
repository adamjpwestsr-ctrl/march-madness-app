"use client";

import { useEffect, useState, useRef } from "react";

// -----------------------------
// TYPES
// -----------------------------
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

// -----------------------------
// AVATAR COLOR HASH
// -----------------------------
function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 55%)`;
}

export default function ForumPanel() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [message, setMessage] = useState("");
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showThreadModal, setShowThreadModal] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // -----------------------------
  // LOAD THREADS
  // -----------------------------
  const loadThreads = async () => {
    const res = await fetch("/api/forum/threads", { cache: "no-store" });
    const json = await res.json();
    if (json.threads) setThreads(json.threads);
  };

  // -----------------------------
  // LOAD POSTS
  // -----------------------------
  const loadPosts = async (threadId: string | null) => {
    const params = threadId ? `?threadId=${threadId}` : "";
    const res = await fetch(`/api/forum/posts${params}`, { cache: "no-store" });
    const json = await res.json();

    if (json.posts) {
      const isUserSending = message.trim().length > 0;

      setPosts(json.posts);

      // Only auto-scroll when *you* send a message
      if (isUserSending) {
        scrollToBottom();
      }
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

  // -----------------------------
  // SUBMIT POST
  // -----------------------------
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
        scrollToBottom();
      }
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // REACTIONS
  // -----------------------------
  const handleReaction = async (postId: string, emoji: string) => {
    await fetch("/api/forum/reactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, emoji }),
    });

    await loadPosts(activeThreadId);
  };

  // -----------------------------
  // CREATE THREAD
  // -----------------------------
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

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <div className="flex w-full min-h-screen bg-slate-950 text-slate-100 overflow-hidden">

      {/* -------------------------------- */}
      {/* FIXED FROSTED SIDEBAR */}
      {/* -------------------------------- */}
      <aside
        className="
          fixed left-0 top-0 bottom-0
          w-[260px] p-6
          bg-white/10 backdrop-blur-xl
          border-r border-white/10
          shadow-xl shadow-black/40
          flex flex-col
          z-20
        "
      >
        <h2 className="text-xl font-semibold tracking-wide mb-4">Pool Chat</h2>

        <button
          onClick={() => setShowThreadModal(true)}
          className="
            w-full mb-4 px-4 py-2 rounded-lg
            bg-emerald-600 hover:bg-emerald-700
            text-white text-sm font-semibold
            transition
          "
        >
          + New Thread
        </button>

        <div className="flex flex-col gap-1 overflow-y-auto pr-2">
          <button
            onClick={() => setActiveThreadId(null)}
            className={`
              text-left px-3 py-2 rounded-md text-sm transition
              ${
                activeThreadId === null
                  ? "bg-emerald-500/30 text-white border border-emerald-400"
                  : "bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10"
              }
            `}
          >
            Main Chat
          </button>

          {threads.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveThreadId(t.id)}
              className={`
                text-left px-3 py-2 rounded-md text-sm transition
                ${
                  activeThreadId === t.id
                    ? "bg-emerald-500/30 text-white border border-emerald-400"
                    : "bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10"
                }
              `}
            >
              {t.title}
            </button>
          ))}
        </div>
      </aside>

      {/* -------------------------------- */}
      {/* MAIN FEED AREA */}
      {/* -------------------------------- */}
      <main className="ml-[260px] flex flex-col w-full bg-slate-950">

        {/* POSTS */}
        <div
          className="
            max-h-[320px]
            overflow-y-auto
            p-6 space-y-4
            scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent
          "
        >
          {posts.map((p) => {
            const name = p.email.split("@")[0];
            const initials = name
              .split(/[\W_]+/)
              .map((n) => n[0]?.toUpperCase())
              .join("")
              .slice(0, 2);

            const time = new Date(p.created_at).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            });

            return (
              <div
                key={p.id}
                className="
                  flex gap-4 p-4 rounded-xl
                  bg-white/10 backdrop-blur-md
                  border border-white/10
                  shadow-lg shadow-black/30
                  transition hover:bg-white/15
                "
              >
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ backgroundColor: stringToColor(p.email) }}
                >
                  {initials}
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-xs text-slate-300 mb-1">
                    <span className="font-semibold text-slate-100">{name}</span>
                    <span>•</span>
                    <span>{time}</span>
                  </div>

                  <div className="text-slate-100 whitespace-pre-wrap">
                    {p.message}
                  </div>

                  {/* Reactions */}
                  <div className="flex gap-2 mt-2">
                    {["🔥", "😂", "😭", "🏀"].map((emoji) => {
                      const count =
                        p.forum_reactions?.filter((r) => r.emoji === emoji)
                          .length || 0;

                      const userReacted = p.forum_reactions?.some(
                        (r) => r.emoji === emoji && r.email === p.email
                      );

                      return (
                        <button
                          key={emoji}
                          onClick={() => handleReaction(p.id, emoji)}
                          className={`
                            px-2 py-1 rounded text-xs border transition
                            ${
                              userReacted
                                ? "bg-emerald-600 border-emerald-500 text-white"
                                : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                            }
                          `}
                        >
                          {emoji} {count > 0 && <span>{count}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          <div ref={bottomRef} />
        </div>

        {/* COMPOSER */}
        <form
          onSubmit={handleSubmit}
          className="
            p-4 border-t border-white/10
            bg-slate-900/80 backdrop-blur-xl
            flex gap-3
          "
        >
          <input
            className="
              flex-1 bg-white/10 text-slate-100 text-sm rounded-lg px-4 py-2
              border border-white/10 focus:outline-none focus:ring-1 focus:ring-emerald-400
            "
            placeholder="Talk trash, celebrate, meltdown..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="
              px-5 py-2 rounded-lg text-sm font-semibold text-white
              bg-emerald-600 hover:bg-emerald-700
              disabled:opacity-50 transition
            "
          >
            Send
          </button>
        </form>
      </main>

      {/* -------------------------------- */}
      {/* THREAD CREATION MODAL */}
      {/* -------------------------------- */}
      {showThreadModal && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900/90 backdrop-blur-xl p-6 rounded-xl w-80 border border-white/10 shadow-xl shadow-black/40 space-y-4">
            <h3 className="text-lg font-semibold text-slate-100">New Thread</h3>

            <input
              className="
                w-full bg-white/10 text-slate-100 rounded px-3 py-2
                border border-white/10 focus:outline-none focus:ring-1 focus:ring-emerald-400
              "
              placeholder="Thread title..."
              value={newThreadTitle}
              onChange={(e) => setNewThreadTitle(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowThreadModal(false)}
                className="
                  px-3 py-2 bg-white/10 text-slate-300 rounded
                  hover:bg-white/20 transition
                "
              >
                Cancel
              </button>

              <button
                onClick={createThread}
                className="
                  px-3 py-2 bg-emerald-600 text-white rounded
                  hover:bg-emerald-700 transition
                "
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
