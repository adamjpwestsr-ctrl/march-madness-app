//app/(app)/sports/march-madness/page.tsx
import BracketWrapper from "@/app/components/bracket/BracketWrapper";

export default async function Page() {
  const { games, picks, bracket } = await getBracketData();

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
