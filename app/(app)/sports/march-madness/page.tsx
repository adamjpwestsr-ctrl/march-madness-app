//app/(app)/sports/march-madness/page.tsx
import BracketWrapper from "@/app/components/bracket/BracketWrapper";

export default function Page({ searchParams }) {
  const { games, picks, bracket } = await getBracketData(); // your existing loader

  return (
    <BracketWrapper
      games={games}
      picks={picks}
      bracket={bracket}
      onPick={onPick}
      onReset={onReset}
    />
  );
}
