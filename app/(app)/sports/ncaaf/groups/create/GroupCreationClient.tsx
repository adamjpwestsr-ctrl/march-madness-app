"use client";

import { useState } from "react";
import GroupCreationModal from "./GroupCreationModal";

export default function GroupCreationClient() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Create NCAAF Private Group</h1>

      <p className="text-slate-300 mb-6">
        Build your own private pick’em group for friends, coworkers, or leagues.
      </p>

      <button
        onClick={() => setOpen(true)}
        className="px-6 py-3 rounded bg-[var(--bb-green)] hover:bg-[var(--bb-green-light)] text-white font-semibold"
      >
        Create Group
      </button>

      {open && <GroupCreationModal onClose={() => setOpen(false)} />}
    </div>
  );
}
