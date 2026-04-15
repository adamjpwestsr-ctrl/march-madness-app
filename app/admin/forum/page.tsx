"use client";

import { useEffect, useState } from "react";

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
  deleted?: boolean;
  forum_reactions?: ForumReaction[];
};

type ForumThread = {
  id: string;
  title: string;
  created_by: string;
  created_at: string;
  pinned?: boolean;
  locked?: boolean;
};

function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 55%)`;
}

export default function AdminForumPage() {
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [includeDeleted, setIncludeDeleted] = useState(true);
  const [muteEmail, setMuteEmail] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Load threads
  const loadThreads = async () => {
    setLoadingThreads(true);
    try {
      const res = await fetch("/api/forum/threads", { cache: "no-store" });
      const json = await res.json();
      if (json.threads) {
        // assume API now returns pinned/locked columns
        setThreads(json.threads as ForumThread[]);
      }
    } finally {
      setLoadingThreads(false);
    }
  };

  // Load posts for selected thread
  const loadPosts = async (threadId: string | null) => {
    setLoadingPosts(true);
    try {
      const params = threadId ? `?threadId=${threadId}` : "";
      const res = await fetch(`/api/forum/posts${params}`, { cache: "no-store" });
      const json = await res.json();
      if (json.posts) {
        const all = json.posts as ForumPost[];
        setPosts(includeDeleted ? all : all.filter((p) => !p.deleted));
      }
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    loadThreads();
  }, []);

  useEffect(() => {
    loadPosts(selectedThreadId);
  }, [selectedThreadId, includeDeleted]);

  // Helpers
  const currentThread = threads.find((t) => t.id === selectedThreadId) || null;

  const refreshAll = async () => {
    await loadThreads();
    await loadPosts(selectedThreadId);
  };

  // Actions
  const handleDeletePost = async (postId: string) => {
    setActionLoading(`delete-post-${postId}`);
    try {
      await fetch("/api/admin/forum/delete-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
      await loadPosts(selectedThreadId);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestorePost = async (postId: string) => {
    setActionLoading(`restore-post-${postId}`);
    try {
      await fetch("/api/admin/forum/restore-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
      await loadPosts(selectedThreadId);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteThread = async () => {
    if (!selectedThreadId) return;
    if (!confirm("Delete this thread and all its posts?")) return;

    setActionLoading("delete-thread");
    try {
      await fetch("/api/admin/forum/delete-thread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId: selectedThreadId }),
      });
      setSelectedThreadId(null);
      await refreshAll();
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleLock = async () => {
    if (!currentThread) return;
    setActionLoading("lock-thread");
    try {
      await fetch("/api/admin/forum/lock-thread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId: currentThread.id,
          locked: !currentThread.locked,
        }),
      });
      await loadThreads();
    } finally {
      setActionLoading(null);
    }
  };

  const handleTogglePin = async () => {
    if (!currentThread) return;
    setActionLoading("pin-thread");
    try {
      await fetch("/api/admin/forum/pin-thread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId: currentThread.id,
          pinned: !currentThread.pinned,
        }),
      });
      await loadThreads();
    } finally {
      setActionLoading(null);
    }
  };

  const handleMuteUser = async () => {
    const email = muteEmail.trim().toLowerCase();
    if (!email) return;
    setActionLoading("mute-user");
    try {
      await fetch("/api/admin/forum/mute-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setMuteEmail("");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnmuteUser = async () => {
    const email = muteEmail.trim().toLowerCase();
    if (!email) return;
    setActionLoading("unmute-user");
    try {
      await fetch("/api/admin/forum/unmute-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setMuteEmail("");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar: Threads */}
      <aside className="w-[280px] border-r border-slate-800 bg-slate-950/90 backdrop-blur-xl flex flex-col">
        <div className="p-5 border-b border-slate-800">
          <h1 className="text-lg font-semibold tracking-wide">Forum Admin</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage threads, posts, and users.
          </p>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 text-xs text-slate-400">
          <span>Threads</span>
          {loadingThreads && <span className="text-[10px] text-emerald-400">Loading…</span>}
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {threads
            .slice()
            .sort((a, b) => {
              const ap = a.pinned ? 1 : 0;
              const bp = b.pinned ? 1 : 0;
              if (ap !== bp) return bp - ap;
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            })
            .map((t) => {
              const active = t.id === selectedThreadId;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedThreadId(t.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs border transition flex flex-col gap-1 ${
                    active
                      ? "bg-emerald-600/20 border-emerald-500 text-emerald-100"
                      : "bg-slate-900/60 border-slate-800 text-slate-200 hover:bg-slate-800/80"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold truncate">{t.title}</span>
                    <div className="flex gap-1 text-[10px]">
                      {t.pinned && (
                        <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          Pinned
                        </span>
                      )}
                      {t.locked && (
                        <span className="px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40">
                          Locked
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(t.created_at).toLocaleString()}
                  </span>
                </button>
              );
            })}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">
              {currentThread ? currentThread.title : "Select a thread"}
            </h2>
            <p className="text-xs text-slate-400">
              {currentThread
                ? `Created ${new Date(currentThread.created_at).toLocaleString()}`
                : "Choose a thread from the left to moderate."}
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <label className="flex items-center gap-2 text-slate-300">
              <input
                type="checkbox"
                checked={includeDeleted}
                onChange={(e) => setIncludeDeleted(e.target.checked)}
                className="h-3 w-3 rounded border-slate-600 bg-slate-900"
              />
              Show deleted posts
            </label>
          </div>
        </div>

        {/* Controls row */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/80 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleTogglePin}
              disabled={!currentThread || !!actionLoading}
              className="px-3 py-1.5 rounded-md border border-amber-500/60 text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 disabled:opacity-40"
            >
              {currentThread?.pinned ? "Unpin Thread" : "Pin Thread"}
            </button>

            <button
              onClick={handleToggleLock}
              disabled={!currentThread || !!actionLoading}
              className="px-3 py-1.5 rounded-md border border-red-500/60 text-red-200 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-40"
            >
              {currentThread?.locked ? "Unlock Thread" : "Lock Thread"}
            </button>

            <button
              onClick={handleDeleteThread}
              disabled={!currentThread || !!actionLoading}
              className="px-3 py-1.5 rounded-md border border-slate-700 text-slate-200 bg-slate-900 hover:bg-slate-800 disabled:opacity-40"
            >
              Delete Thread
            </button>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <input
              type="email"
              placeholder="user@example.com"
              value={muteEmail}
              onChange={(e) => setMuteEmail(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-100 w-52 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              onClick={handleMuteUser}
              disabled={!muteEmail.trim() || !!actionLoading}
              className="px-3 py-1.5 rounded-md border border-emerald-500/60 text-emerald-200 bg-emerald-500/10 hover:bg-emerald-500/20 disabled:opacity-40"
            >
              Mute
            </button>
            <button
              onClick={handleUnmuteUser}
              disabled={!muteEmail.trim() || !!actionLoading}
              className="px-3 py-1.5 rounded-md border border-slate-600 text-slate-200 bg-slate-900 hover:bg-slate-800 disabled:opacity-40"
            >
              Unmute
            </button>
          </div>
        </div>

        {/* Posts list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-slate-950 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {loadingPosts && (
            <div className="text-xs text-slate-400">Loading posts…</div>
          )}

          {!loadingPosts && posts.length === 0 && (
            <div className="text-xs text-slate-500">
              {currentThread
                ? "No posts in this thread yet."
                : "Select a thread to view posts."}
            </div>
          )}

          {posts.map((p) => {
            const name = p.email.split("@")[0];
            const initials = name
              .split(/[\W_]+/)
              .map((n) => n[0]?.toUpperCase())
              .join("")
              .slice(0, 2);

            const time = new Date(p.created_at).toLocaleString();

            const isDeleted = !!p.deleted;

            return (
              <div
                key={p.id}
                className={`flex gap-4 p-4 rounded-xl border shadow-sm shadow-black/30 bg-slate-900/80 ${
                  isDeleted
                    ? "border-red-700/70 bg-red-950/40"
                    : "border-slate-800 hover:bg-slate-900"
                }`}
              >
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ backgroundColor: stringToColor(p.email) }}
                >
                  {initials}
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <span className="font-semibold text-slate-100">
                        {name}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400">{p.email}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400">{time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px]">
                      {isDeleted && (
                        <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-200 border border-red-500/40">
                          Deleted
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    className={`text-sm whitespace-pre-wrap ${
                      isDeleted ? "line-through text-slate-500" : "text-slate-100"
                    }`}
                  >
                    {p.message}
                  </div>

                  {/* Reactions */}
                  {p.forum_reactions && p.forum_reactions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 text-xs">
                      {["🔥", "😂", "😭", "🏀"].map((emoji) => {
                        const count =
                          p.forum_reactions?.filter((r) => r.emoji === emoji)
                            .length || 0;
                        if (!count) return null;
                        return (
                          <span
                            key={emoji}
                            className="px-2 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-200"
                          >
                            {emoji} {count}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3 text-xs">
                    {!isDeleted ? (
                      <button
                        onClick={() => handleDeletePost(p.id)}
                        disabled={!!actionLoading}
                        className="px-3 py-1.5 rounded-md border border-red-500/60 text-red-200 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-40"
                      >
                        Delete Post
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRestorePost(p.id)}
                        disabled={!!actionLoading}
                        className="px-3 py-1.5 rounded-md border border-emerald-500/60 text-emerald-200 bg-emerald-500/10 hover:bg-emerald-500/20 disabled:opacity-40"
                      >
                        Restore Post
                      </button>
                    )}
                    <span className="text-[10px] text-slate-500">
                      ID: {p.id}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
