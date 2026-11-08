type TeamHeaderProps = {
  name?: string;
  logo?: string | null;
  seed?: number | string | null;
  align?: "left" | "right";
  conference?: string;
  record?: string;
  primaryColor?: string;
};

export default function TeamHeader({
  name,
  logo,
  seed,
  align,
  conference,
  record,
  primaryColor,
}: TeamHeaderProps) {
  const hasLogo =
    typeof logo === "string" && logo.trim().length > 0;

  const initials = (name || "TBD")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  const isRight = align === "right";

  return (
    <div
      className={`flex min-w-0 items-center gap-3 sm:gap-4 ${
        isRight ? "flex-row-reverse text-right" : "text-left"
      }`}
    >
      {/* Team identity / logo */}
      <div
        className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 shadow-xl sm:h-20 sm:w-20"
        style={{
          background: hasLogo
            ? "linear-gradient(145deg, #1e293b, #0f172a)"
            : `linear-gradient(145deg, ${primaryColor || "#334155"}55, #0f172a)`,
          boxShadow: `0 8px 24px ${primaryColor || "#334155"}22`,
        }}
      >
        {hasLogo ? (
          <img
            src={logo}
            alt={`${name} logo`}
            className="h-12 w-12 object-contain sm:h-16 sm:w-16"
          />
        ) : (
          <span
            className="text-xl font-black tracking-tight sm:text-2xl"
            style={{ color: primaryColor || "#cbd5e1" }}
          >
            {initials}
          </span>
        )}

        {/* Seed badge */}
        <span className="absolute -bottom-2 -right-2 flex h-7 min-w-7 items-center justify-center rounded-full border-2 border-[#0b1426] bg-slate-700 px-1.5 text-xs font-black text-white shadow-lg">
          {seed ?? "–"}
        </span>
      </div>

      {/* Team information */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-base font-black leading-tight tracking-tight text-white sm:text-xl">
          {name || "TBD"}
        </h3>

        {conference && conference !== "Unknown" && (
          <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 sm:text-xs">
            {conference}
          </p>
        )}

        {record && record !== "0-0" && (
          <p className="mt-1 text-xs font-semibold text-slate-300">
            {record}
          </p>
        )}
      </div>
    </div>
  );
}
