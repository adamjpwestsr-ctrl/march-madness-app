export default function getHistoricalFact(seedA, seedB) {
  const matchup = `${seedA}-${seedB}`;

  const facts = {
    "1-16": "1‑seeds are 150–2 all‑time vs 16‑seeds.",
    "2-15": "2‑seeds have only lost to 15‑seeds 11 times in tournament history.",
    "3-14": "14‑seeds have upset 3‑seeds 22 times since 1985.",
    "4-13": "13‑seeds have beaten 4‑seeds 31 times in tournament history.",
    "5-12": "12‑seeds upset 5‑seeds in 35% of first‑round games.",
    "6-11": "11‑seeds have reached the Sweet 16 more often than 6‑seeds since 2000.",
    "7-10": "10‑seeds have historically performed well against 7‑seeds with frequent upsets.",
    "8-9": "8‑vs‑9 matchups are true toss‑ups with nearly even historical outcomes.",
  };

  return facts[matchup] || "This matchup has a balanced historical profile with no major trends.";
}
