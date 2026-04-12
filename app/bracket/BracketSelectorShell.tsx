"use client";

import BracketSelectorClient from "./BracketSelectorClient";

export default function BracketSelectorShell({
  brackets,
  activeId,
}: {
  brackets: {
    bracket_id: string;
    bracket_name: string | null;
    icon: string | null;
  }[];
  activeId: string;
}) {
  return (
    <div
      className="
        w-full
        flex items-center justify-between
        mb-8
        px-1
      "
    >
      {/* Title */}
      <h1 className="text-2xl font-bold tracking-wide text-slate-100">
        Your Bracket
      </h1>

      {/* Selector */}
      <BracketSelectorClient brackets={brackets} activeId={activeId} />
    </div>
  );
}
