//app/(app)/sports/march-madness/page.tsx
import BracketPage from "@/app/_legacy/bracket/page";

export default function MarchMadnessPage({
  searchParams,
}: {
  searchParams: { bid?: string };
}) {
  return <BracketPage searchParams={searchParams} />;
}
