//app/(app)/sports/march-madness/page.tsx
"use client";

import BracketShell from "@/app/_legacy/bracket/BracketShell";

export default function MarchMadnessPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">March Madness Bracket Challenge</h1>
      <p className="text-muted-foreground">
        Fill out your bracket, track your picks, and compete for the top spot.
      </p>
      <BracketShell />
    </div>
  );
}
