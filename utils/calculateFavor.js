import { getConferenceStrength } from "@/utils/conferenceStrength";

/* -------------------------------------------------------
   FAVORABILITY ENGINE — BracketBoss
------------------------------------------------------- */

export default function calculateFavor(teamA, teamB) {
  const scoreA = computeCompositeScore(teamA, teamB);
  const scoreB = computeCompositeScore(teamB, teamA);

  const safeScoreA = Number.isFinite(scoreA) ? scoreA : 0.5;
  const safeScoreB = Number.isFinite(scoreB) ? scoreB : 0.5;

  const total = safeScoreA + safeScoreB || 1;

  let percentA = Math.round((safeScoreA / total) * 100);
  let percentB = 100 - percentA;

  // Keep existing 1%–99% display limits.
  percentA = Math.min(Math.max(percentA, 1), 99);
  percentB = Math.min(Math.max(percentB, 1), 99);

  const nameA = teamA?.team_name || teamA?.name || "Team A";
  const nameB = teamB?.team_name || teamB?.name || "Team B";

  return {
    favoredTeam: percentA > percentB ? nameA : nameB,
    percent: Math.max(percentA, percentB),
  };
}

/* -------------------------------------------------------
   COMPOSITE SCORE
------------------------------------------------------- */

function computeCompositeScore(team, opponent) {
  const conferenceScore = getConferenceScore(
    team?.conference,
    opponent?.conference
  );

  const sosScore = getSOSScore(team?.sos);

  const top10Score = getTop10Score(
    team?.vsTop10 || team?.vs_top_10,
    opponent?.vsTop10 || opponent?.vs_top_10
  );

  const recordScore = getRecordScore(
    team?.record,
    opponent?.record,
    team?.conference,
    opponent?.conference
  );

  const safeConference = safeScore(conferenceScore);
  const safeSOS = safeScore(sosScore);
  const safeTop10 = safeScore(top10Score);
  const safeRecord = safeScore(recordScore);

  return (
    safeConference * 0.5 +
    safeSOS * 0.2 +
    safeTop10 * 0.15 +
    safeRecord * 0.15
  );
}

function safeScore(value) {
  return Number.isFinite(value) ? value : 0.5;
}

/* -------------------------------------------------------
   1. CONFERENCE STRENGTH

   Uses the isolated conferenceStrength configuration.

   A missing or unrecognized conference is neutral.
   The rating difference contributes gradually rather
   than automatically deciding the matchup.
------------------------------------------------------- */

function getConferenceScore(confA, confB) {
  const strengthA = getConferenceStrength(confA);
  const strengthB = getConferenceStrength(confB);

  if (strengthA === null || strengthB === null) {
    return 0.5;
  }

  // A 10-point rating difference creates a 10% edge
  // in this component, not in the final matchup result.
  const score = 0.5 + (strengthA - strengthB) / 100;

  return Math.min(Math.max(score, 0.2), 0.8);
}

/* -------------------------------------------------------
   2. SOS SCORE
   Rank 1–150; lower rank = tougher schedule.
------------------------------------------------------- */

function getSOSScore(sos) {
  if (sos === null || sos === undefined || sos === "") {
    return 0.5;
  }

  const rank = parseInt(sos, 10);

  if (!Number.isFinite(rank)) return 0.5;

  const clamped = Math.min(Math.max(rank, 1), 150);

  // Rank 1 → 1.0, Rank 150 → 0.0.
  const strength = 1 - (clamped - 1) / 149;

  return Math.min(Math.max(strength, 0), 1);
}

/* Exported for HistoricalInsight. */
export function normalizeSOS(sos) {
  if (sos === null || sos === undefined || sos === "") {
    return 75;
  }

  const rank = parseInt(sos, 10);

  if (!Number.isFinite(rank)) return 75;

  return Math.min(Math.max(rank, 1), 150);
}

/* -------------------------------------------------------
   3. TOP 10 RECORD
------------------------------------------------------- */

function getTop10Score(recA, recB) {
  const a = parseRecord(recA);
  const b = parseRecord(recB);

  const pctA = a.total > 0 ? a.wins / a.total : 0.5;
  const pctB = b.total > 0 ? b.wins / b.total : 0.5;

  const sum = pctA + pctB || 1;

  return pctA / sum;
}

/* -------------------------------------------------------
   4. OVERALL RECORD
   Retains the existing +9-win rule.
------------------------------------------------------- */

function getRecordScore(recA, recB, confA, confB) {
  const a = parseRecord(recA);
  const b = parseRecord(recB);

  const pctA = a.total > 0 ? a.wins / a.total : 0.5;
  const pctB = b.total > 0 ? b.wins / b.total : 0.5;

  const powerConferences = [
    "SEC",
    "Big Ten",
    "ACC",
    "Big 12",
    "Big East",
  ];

  const isA_Power = confA && powerConferences.includes(confA);
  const isB_Power = confB && powerConferences.includes(confB);

  // Preserve the existing +9-win adjustment.
  if (!isA_Power && isB_Power && a.wins - b.wins >= 9) {
    return 0.7;
  }

  if (!isB_Power && isA_Power && b.wins - a.wins >= 9) {
    return 0.3;
  }

  const sum = pctA + pctB || 1;

  return pctA / sum;
}

/* -------------------------------------------------------
   SHARED RECORD PARSER
------------------------------------------------------- */

function parseRecord(record) {
  if (
    !record ||
    typeof record !== "string" ||
    !/^\s*\d+\s*-\s*\d+\s*$/.test(record)
  ) {
    return { wins: 0, losses: 0, total: 0 };
  }

  const [wins, losses] = record
    .split("-")
    .map((value) => parseInt(value.trim(), 10));

  return {
    wins,
    losses,
    total: wins + losses,
  };
}