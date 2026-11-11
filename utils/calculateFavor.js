
import { getConferenceStrength } from "@/utils/conferenceStrength";

/* -------------------------------------------------------
   FAVORABILITY ENGINE — BracketBoss

   Conference strength establishes the initial advantage.
   Team performance determines whether that advantage
   holds or whether the opponent earns the model's lean.

   MODEL WEIGHTS:
   Conference strength: 40%
   Last 10:             20%
   Overall record:      15%
   Strength of schedule:15%
   Against top 10:      10%
------------------------------------------------------- */

const WEIGHTS = {
  conference: 0.40,
  last10: 0.20,
  record: 0.15,
  sos: 0.15,
  top10: 0.10,
};

export default function calculateFavor(teamA, teamB) {
  const scoreA = computeCompositeScore(teamA, teamB);
  const scoreB = computeCompositeScore(teamB, teamA);

  const safeScoreA = Number.isFinite(scoreA) ? scoreA : 0.5;
  const safeScoreB = Number.isFinite(scoreB) ? scoreB : 0.5;

  const total = safeScoreA + safeScoreB || 1;

  let percentA = Math.round((safeScoreA / total) * 100);
  let percentB = 100 - percentA;

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

  const last10Score = getRecordComparison(
    team?.last10 || team?.last_10,
    opponent?.last10 || opponent?.last_10
  );

  const recordScore = getRecordComparison(
    team?.record,
    opponent?.record
  );

  const sosScore = getSOSComparison(
    team?.sos,
    opponent?.sos
  );

  const top10Score = getRecordComparison(
    team?.vsTop10 || team?.vs_top_10,
    opponent?.vsTop10 || opponent?.vs_top_10
  );

  return (
    conferenceScore * WEIGHTS.conference +
    last10Score * WEIGHTS.last10 +
    recordScore * WEIGHTS.record +
    sosScore * WEIGHTS.sos +
    top10Score * WEIGHTS.top10
  );
}

/* -------------------------------------------------------
   1. CONFERENCE STRENGTH

   Higher conference rating = stronger conference.

   Unknown conferences are neutral.
------------------------------------------------------- */

function getConferenceScore(confA, confB) {
  const strengthA = getConferenceStrength(confA);
  const strengthB = getConferenceStrength(confB);

  if (strengthA === null || strengthB === null) {
    return 0.5;
  }

  const difference = strengthA - strengthB;

  // A 30-point conference difference creates a
  // maximum 30-point advantage within this category.
  const score = 0.5 + difference / 100;

  return clamp(score, 0.2, 0.8);
}

/* -------------------------------------------------------
   2. OVERALL RECORD / LAST 10 / TOP 10

   Compare winning percentages directly.

   A missing statistic is neutral.
------------------------------------------------------- */

function getRecordComparison(recordA, recordB) {
  const a = parseRecord(recordA);
  const b = parseRecord(recordB);

  if (!a || !b) return 0.5;

  return compareValues(a.percentage, b.percentage);
}

/* -------------------------------------------------------
   3. STRENGTH OF SCHEDULE

   Lower SOS rank = tougher schedule = advantage.

   Example:
   SOS 40 beats SOS 44.
------------------------------------------------------- */

function getSOSComparison(sosA, sosB) {
  const a = parseSOS(sosA);
  const b = parseSOS(sosB);

  if (a === null || b === null) return 0.5;

  return compareValues(b, a);
}

/* -------------------------------------------------------
   SHARED COMPARISON

   Produces a symmetric matchup score:
   A score + reverse B score = 1.
------------------------------------------------------- */

function compareValues(valueA, valueB) {
  if (
    !Number.isFinite(valueA) ||
    !Number.isFinite(valueB)
  ) {
    return 0.5;
  }

  const total = Math.abs(valueA) + Math.abs(valueB);

  if (total === 0) return 0.5;

  return valueA / (valueA + valueB || 1);
}

/* -------------------------------------------------------
   SHARED RECORD PARSER
------------------------------------------------------- */

function parseRecord(record) {
  if (!record || typeof record !== "string") {
    return null;
  }

  const match = record
    .trim()
    .match(/^(\d+)\s*[-–]\s*(\d+)$/);

  if (!match) return null;

  const wins = Number(match[1]);
  const losses = Number(match[2]);
  const total = wins + losses;

  if (total === 0) return null;

  return {
    wins,
    losses,
    total,
    percentage: wins / total,
  };
}

/* -------------------------------------------------------
   SOS PARSER

   Rank 1 = toughest schedule.
   Rank 150 = weakest schedule.
------------------------------------------------------- */

function parseSOS(sos) {
  if (sos === null || sos === undefined || sos === "") {
    return null;
  }

  const rank = Number(sos);

  if (!Number.isFinite(rank)) return null;

  return clamp(rank, 1, 150);
}

/* -------------------------------------------------------
   EXPORTED FOR HISTORICAL INSIGHT
------------------------------------------------------- */

export function normalizeSOS(sos) {
  const rank = parseSOS(sos);

  return rank === null ? 75 : rank;
}

/* -------------------------------------------------------
   HELPERS
------------------------------------------------------- */

function clamp(value, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}
