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
    <div className="mb-6 flex items-center gap-4">
      <h1 className="text-2xl font-bold">Your Bracket</h1>

      <BracketSelectorClient brackets={brackets} activeId={activeId} />
    </div>
  );
}
