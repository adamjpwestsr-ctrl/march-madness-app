"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type ForumUser = {
  user_id?: number | string;
  email?: string;
  name?: string;
  username?: string | null;
};

type Thread = {
  id: string;
  title: string;
};

type Post = {
  id: string;
  display_name: string;
  message: string;
  created_at: string;
  thread_id: string;
  email?: string | null;
};

type ForumProps = {
  currentUser: ForumUser | null;
};

const COMMISSIONER_IDS = [2, 88];
const COMMISSIONER_EMAILS = [
  "lfahearn@gmail.com",
  "adamjpwestsr@gmail.com",
];

function getDisplayName(user: ForumUser | null) {
  return user?.name?.trim() || user?.username?.trim() || user?.email?.split("@")[0] || "Player";
}

function isCommissioner(post: Post) {
  const email = post.email?.toLowerCase().trim() || "";
  const name = post.display_name?.toLowerCase().trim() || "";

  return (
    COMMISSIONER_EMAILS.includes(email) ||
    name === "batman" ||
    name === "liam ahearn"
  );
}

function formatPostDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function Forum({ currentUser }: ForumProps) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  const initialized = useRef(false);
  const feedRef = useRef<HTMLDivElement>(null);

  const displayName = getDisplayName(currentUser);
  const userEmail = currentUser?.email?.trim().toLowerCase() || "";
  const seenKey = `bracketboss-forum-last-seen-${currentUser?.user_id ?? userEmail}`;

  const markAsRead = useCallback((latestPosts: Post[]) => {
    const latestPost = latestPosts[latestPosts.length - 1];

    if (latestPost) {
      localStorage.setItem(seenKey, latestPost.created_at);
    }

    setUnreadCount(0);
  }, [seenKey]);

  const loadPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/march-madness-v2/forum/get", {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Unable to load forum messages.");
      }

      const data: Post[] = await res.json();
      const orderedPosts = Array.isArray(data) ? data : [];

      setPosts(orderedPosts);

      const latestPost = orderedPosts[orderedPosts.length - 1];

      if (!initialized.current) {
        initialized.current = true;

        const lastSeen = localStorage.getItem(seenKey);

        // First visit: treat existing posts as already seen.
if (!lastSeen) {
  localStorage.setItem(
    seenKey,
    latestPost?.created_at || new Date().toISOString()
  );
} else if (lastSeen) {
          const unread = orderedPosts.filter(
            (post) => new Date(post.created_at).getTime() > new Date(lastSeen).getTime()
          ).length;

          setUnreadCount(unread);
        }
      } else if (isOpen) {
        markAsRead(orderedPosts);
      } else {
        const lastSeen = localStorage.getItem(seenKey);

        if (lastSeen) {
          const unread = orderedPosts.filter(
            (post) => new Date(post.created_at).getTime() > new Date(lastSeen).getTime()
          ).length;

          setUnreadCount(unread);
        }
      }
    } catch (err) {
      console.error("Forum load error:", err);
      setError("The conversation could not be loaded. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, markAsRead, seenKey]);

  useEffect(() => {
    async function loadThreads() {
      try {
        const res = await fetch("/api/march-madness-v2/forum/getThreads", {
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Unable to load forum setup.");

        const data = await res.json();
        setThreads(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Forum thread load error:", err);
      }
    }

    loadThreads();
  }, []);

  useEffect(() => {
    loadPosts();

    const interval = window.setInterval(loadPosts, 30000);

    return () => window.clearInterval(interval);
  }, [loadPosts]);

  useEffect(() => {
    if (isOpen) {
      markAsRead(posts);

      // Keep the newest conversation visible when opened or updated.
      requestAnimationFrame(() => {
        if (feedRef.current) {
          feedRef.current.scrollTop = feedRef.current.scrollHeight;
        }
      });
    }
  }, [isOpen, posts, markAsRead]);

  async function handlePost() {
    const trimmedMessage = message.trim();
    const threadId = threads[0]?.id;

    if (!trimmedMessage || !threadId || !userEmail || isPosting) return;

    setError("");
    setIsPosting(true);

    try {
      const res = await fetch("/api/march-madness-v2/forum/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: displayName,
          email: userEmail,
          message: trimmedMessage,
          thread_id: threadId,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Your message could not be posted.");
      }

      setMessage("");
      await loadPosts();
      markAsRead(posts);
    } catch (err) {
      console.error("Forum post error:", err);
      setError(err instanceof Error ? err.message : "Your message could not be posted.");
    } finally {
      setIsPosting(false);
    }
  }

  function handleToggle() {
    const nextOpen = !isOpen;

    setIsOpen(nextOpen);

    if (nextOpen) {
      markAsRead(posts);
    }
  }

  return (
    <section className="overflow-hidden rounded-xl border border-slate-700/80 bg-slate-950 shadow-lg">
      <button
        type="button"
        onClick={handleToggle}
        className="flex w-full items-center justify-between gap-3 bg-slate-900 px-4 py-3 text-left transition hover:bg-slate-800"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-blue-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 10h8M8 14h5m-8 6 2.5-3H18a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h2"
              />
            </svg>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-bold text-white">BracketBoss Forum</h2>

              {unreadCount > 0 && (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">
                  {unreadCount} new
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400">
              {isOpen ? "Join the conversation" : "Player chat and commissioner updates"}
            </p>
          </div>
        </div>

        <span className="shrink-0 text-sm font-semibold text-blue-300">
          {isOpen ? "Close −" : "Open +"}
        </span>
      </button>

      {isOpen && (
        <div className="border-t border-slate-800 p-3">
          <div
            ref={feedRef}
            className="h-[280px] space-y-3 overflow-y-auto rounded-lg border border-slate-800 bg-slate-900/70 p-3"
          >
            {isLoading ? (
              <p className="py-8 text-center text-sm text-slate-400">
                Loading conversation...
              </p>
            ) : posts.length === 0 ? (
              <div className="py-10 text-center">
                <p className="font-semibold text-slate-300">The conversation starts here.</p>
                <p className="mt-1 text-xs text-slate-500">
                  Be the first to post a message.
                </p>
              </div>
            ) : (
              posts.map((post) => {
                const commissioner = isCommissioner(post);
                const announcement = post.message
                  .trim()
                  .toUpperCase()
                  .startsWith("COMMISSIONER'S NOTE:");

                return (
                  <article
                    key={post.id}
                    className={`rounded-lg border p-3 ${
                      announcement
                        ? "border-yellow-500/50 bg-yellow-500/10"
                        : commissioner
                        ? "border-blue-500/30 bg-blue-500/5"
                        : "border-slate-700/70 bg-slate-950/70"
                    }`}
                  >
                    <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-white">
                          {post.display_name}
                        </span>

                        {commissioner && (
                          <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-blue-300">
                            Commissioner
                          </span>
                        )}

                        {announcement && (
                          <span className="rounded bg-yellow-500/20 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-yellow-300">
                            Official Note
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] text-slate-500">
                        {formatPostDate(post.created_at)}
                      </span>
                    </div>

                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-200">
                      {post.message}
                    </p>
                  </article>
                );
              })
            )}
          </div>

          <div className="mt-3 rounded-lg border border-slate-700 bg-slate-900 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-xs text-slate-400">
                Posting as <strong className="text-white">{displayName}</strong>
              </span>

              {currentUser?.user_id != null &&
                COMMISSIONER_IDS.includes(Number(currentUser.user_id)) && (
                  <span className="text-[10px] font-bold uppercase tracking-wide text-blue-300">
                    Commissioner account
                  </span>
                )}
            </div>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handlePost();
                }
              }}
              placeholder="Write a message... (Enter to post, Shift + Enter for a new line)"
              rows={3}
              maxLength={2000}
              className="w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
            />

            {error && (
              <p className="mt-2 text-xs text-red-400">{error}</p>
            )}

            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-[10px] text-slate-500">
                {message.length}/2000 characters
              </span>

              <button
                type="button"
                onClick={handlePost}
                disabled={!message.trim() || !threads.length || isPosting || !userEmail}
                className="rounded-lg bg-blue-500 px-5 py-2 text-sm font-extrabold text-white shadow transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isPosting ? "POSTING..." : "POST MESSAGE"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}