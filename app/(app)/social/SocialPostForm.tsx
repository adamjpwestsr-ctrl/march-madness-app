"use client";

import { useState, useTransition } from "react";

export default function SocialPostForm({ userId }: { userId: number }) {
  const [content, setContent] = useState("");
  const [sport, setSport] = useState("General");
  const [isPending, startTransition] = useTransition();

  const submitPost = async () => {
    startTransition(async () => {
      await fetch("/api/social/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, content, sport }),
      });

      setContent("");
      window.location.reload();
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share your thoughts..."
        className="w-full p-3 rounded-lg bg-slate-800 text-white"
      />

      <div className="flex justify-between mt-3">
        <select
          value={sport}
          onChange={(e) => setSport(e.target.value)}
          className="bg-slate-800 text-white p-2 rounded-lg"
        >
          <option>General</option>
          <option>NFL</option>
          <option>NCAAF</option>
          <option>F1</option>
          <option>NBA</option>
          <option>MLB</option>
          <option>NHL</option>
          <option>Golf</option>
          <option>NASCAR</option>
        </select>

        <button
          onClick={submitPost}
          disabled={isPending}
          className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg"
        >
          Post
        </button>
      </div>
    </div>
  );
}
