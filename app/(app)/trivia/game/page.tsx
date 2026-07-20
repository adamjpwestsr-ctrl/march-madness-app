"use client";

import { Suspense } from "react";
import TriviaGamePageInner from "./TriviaGamePageInner";

export default function TriviaGamePage() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <TriviaGamePageInner />
    </Suspense>
  );
}
