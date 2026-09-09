"use client";

import React from "react";
import GroupInvitePanel from "./GroupInvitePanel";

export default function GroupInviteModal({
  groupId,
  onClose,
}: {
  groupId: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-950 p-8 rounded-2xl border border-white/10 shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-yellow-400 mb-4 text-center">
          Invite to Group
        </h2>

        <GroupInvitePanel groupId={groupId} />

        <button
          onClick={onClose}
          className="mt-6 w-full p-3 rounded-lg bg-slate-800 text-white border border-white/10 hover:bg-slate-700 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}
