
type SeedBadgeProps = {
  seed: number | string;
};

export default function SeedBadge({ seed }: SeedBadgeProps) {
  const numericSeed = Number(seed);

  const tier =
    numericSeed <= 4 ? "bg-yellow-500" :
    numericSeed <= 8 ? "bg-gray-400" :
    numericSeed <= 12 ? "bg-orange-600" :
    "bg-slate-600";

  return (
    <span className={`${tier} text-xs px-2 py-1 rounded-md text-black font-semibold`}>
      Seed {seed}
    </span>
  );
}
