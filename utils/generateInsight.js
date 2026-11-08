export default function generateInsight(teamA, teamB) {
  const aWinPct = winPercentage(teamA?.record);
  const bWinPct = winPercentage(teamB?.record);

  const aSOS = safeNumber(teamA?.sos);
  const bSOS = safeNumber(teamB?.sos);

  const aLast10 = winPercentage(teamA?.last10);
  const bLast10 = winPercentage(teamB?.last10);

  const nameA = teamA?.team_name || teamA?.name || "TBD";
  const nameB = teamB?.team_name || teamB?.name || "TBD";

  let insight = "";

  // 🧠 Correct interpretation:
  // LOWER SOS = tougher schedule
  const aTougherSchedule = aSOS < bSOS;
  const bTougherSchedule = bSOS < aSOS;

  // 🔥 Strong schedule + strong momentum
  if (aTougherSchedule && aLast10 > bLast10) {
    insight = `${nameA} enters with a stronger schedule and better recent momentum.`;
  } else if (bTougherSchedule && bLast10 > aLast10) {
    insight = `${nameB} enters with a stronger schedule and better recent momentum.`;

  // 📈 Stronger overall record
  } else if (aWinPct > bWinPct) {
    insight = `${nameA} holds the stronger overall record and may have a slight edge.`;
  } else if (bWinPct > aWinPct) {
    insight = `${nameB} has the better season record and could surprise here.`;

  // 🤝 Even matchup
  } else {
    insight = `Both teams enter with comparable profiles, making this a potential toss‑up.`;
  }

  return insight;
}

// Convert "18-12" → win percentage
function winPercentage(record) {
  if (!record || typeof record !== "string" || !record.includes("-")) return 0;

  const [wins, losses] = record.split("-").map((n) => Number(n) || 0);
  const total = wins + losses;

  return total > 0 ? wins / total : 0;
}

// Convert SOS or numeric-like values safely
function safeNumber(value) {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}
