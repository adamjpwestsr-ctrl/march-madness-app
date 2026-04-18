// ⭐ Add props interface
interface PrizePoolCardProps {
  pool: {
    total_entries: number;
    total_mulligans: number;
    gross_pot_cents: number;
    rake_percent: number;
    rake_cents: number;
    prize_pool_cents: number;
    third_place_cents: number;
    second_place_cents: number;
    first_place_cents: number;
  };
}

export default function PrizePoolCard({ pool }: PrizePoolCardProps) {
  const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <div
      style={{
        background: "#1e293b",
        border: "1px solid #475569",
        borderRadius: 12,
        padding: 16,
        color: "#e5e7eb"
      }}
    >
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>
        Prize Pool
      </h2>

      {/* POT DETAILS */}
      <div style={{ fontSize: 14, marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Total Entries</span>
          <span>{pool.total_entries}</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Mulligans Used</span>
          <span>{pool.total_mulligans}</span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 10
          }}
        >
          <span>Gross Pot</span>
          <span>{fmt(pool.gross_pot_cents)}</span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 12,
            color: "#94a3b8"
          }}
        >
          <span>Bracket Fee({pool.rake_percent}%)</span>
          <span>-{fmt(pool.rake_cents)}</span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 6,
            fontWeight: 600,
            color: "#34d399"
          }}
        >
          <span>Prize Pool</span>
          <span>{fmt(pool.prize_pool_cents)}</span>
        </div>
      </div>

      {/* PAYOUTS */}
      <div style={{ borderTop: "1px solid #475569", paddingTop: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>🥉 3rd Place</span>
          <span>{fmt(pool.third_place_cents)}</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>🥈 2nd Place</span>
          <span>{fmt(pool.second_place_cents)}</span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 6,
            fontWeight: 700,
            color: "#fbbf24"
          }}
        >
          <span>🥇 1st Place</span>
          <span>{fmt(pool.first_place_cents)}</span>
        </div>
      </div>
    </div>
  );
}
