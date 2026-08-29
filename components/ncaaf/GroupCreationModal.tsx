"use client";

import { useState } from "react";

export default function GroupCreationModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [scope, setScope] = useState("ALL");
  const [maxEntries, setMaxEntries] = useState<number | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [passcode, setPasscode] = useState(generatePasscode());
  const [email, setEmail] = useState("");

  const handleSubmit = async () => {
    const res = await fetch("/api/ncaaf/groups/create", {
      method: "POST",
      body: JSON.stringify({
        name,
        scope,
        maxEntries,
        isPaid,
        passcode,
        email,
      }),
    });

    const json = await res.json();

    if (json.error) {
      alert(json.error);
      return;
    }

    alert("Group created successfully!");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[var(--bb-slate-light)] p-6 rounded-xl w-full max-w-lg space-y-4 border border-[var(--bb-green)]">

        <h2 className="text-xl font-semibold text-white">Create Private Group</h2>

        <div className="space-y-2">
          <label className="text-sm text-slate-300">Your Email</label>
          <input
            type="email"
            className="w-full px-3 py-2 rounded bg-[var(--bb-slate)] border border-[var(--bb-green)] text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-slate-300">Group Name</label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded bg-[var(--bb-slate)] border border-[var(--bb-green)] text-white"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Adam's Pick'em League"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-slate-300">Game Scope</label>
          <select
            className="w-full px-3 py-2 rounded bg-[var(--bb-slate)] border border-[var(--bb-green)] text-white"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
          >
            <option value="ALL">All Games</option>
            <option value="POWER5">Power 5 Only</option>
            <option value="TOP25">Top 25 Only</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-slate-300">Max Entries (optional)</label>
          <input
            type="number"
            className="w-full px-3 py-2 rounded bg-[var(--bb-slate)] border border-[var(--bb-green)] text-white"
            value={maxEntries ?? ""}
            onChange={(e) =>
              setMaxEntries(e.target.value ? parseInt(e.target.value) : null)
            }
            placeholder="Unlimited"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isPaid}
            onChange={(e) => setIsPaid(e.target.checked)}
          />
          <label className="text-sm text-slate-300">Paid Challenge</label>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-slate-300">Passcode</label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded bg-[var(--bb-slate)] border border-[var(--bb-green)] text-white tracking-[0.4em] text-center"
            value={passcode}
            readOnly
          />
          <button
            onClick={() => setPasscode(generatePasscode())}
            className="text-sm text-[var(--bb-gold)] hover:text-white"
          >
            Regenerate
          </button>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-slate-700 text-white"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded bg-[var(--bb-green)] text-white font-semibold"
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
}

function generatePasscode() {
  return Math.floor(10000 + Math.random() * 90000).toString();
}
