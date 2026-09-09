"use client";

import React, { useState } from "react";

export default function GroupInvitePanel({
  groupId,
  onInviteSent,
}: {
  groupId: string;
  onInviteSent?: () => void;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  const sendInvite = async () => {
    setStatus("Sending...");

    const res = await fetch("/api/march-madness-v2/group-invite", {
      method: "POST",
      body: JSON.stringify({ groupId, email }),
    });

    if (res.ok) {
      setStatus("Invite sent!");
      onInviteSent?.();
    } else {
      setStatus("Failed to send invite.");
    }
  };

  return (
    <div className="rounded-xl bg-slate-900/60 border border-white/10 p-6 shadow-lg">
      <h2 className="text-xl font-bold text-yellow-400 mb-4">
        Invite Someone to Your Group
      </h2>

      <input
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-3 rounded-lg bg-slate-800 text-white border border-white/10 mb-4"
      />

      <button
        onClick={sendInvite}
        className="w-full p-3 rounded-lg bg-yellow-500 text-black font-bold hover:bg-yellow-400 transition"
      >
        Send Invite
      </button>

      {status && (
        <p className="text-slate-300 text-sm mt-3 text-center">{status}</p>
      )}
    </div>
  );
}
