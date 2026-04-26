/**
 * transformTrivia.js
 *
 * Reads your existing CSV (649 questions),
 * generates multiple-choice distractors,
 * and outputs a new CSV ready for Supabase import.
 */

const fs = require("fs");
const path = require("path");
const Papa = require("papaparse");

// ------------------------------
// 1. Load CSV
// ------------------------------
function loadCSV(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return Papa.parse(raw, {
    header: true,
    skipEmptyLines: true,
  }).data;
}

// ------------------------------
// 2. Utility: Normalize answers
// ------------------------------
function normalizeAnswer(str) {
  return str
    .replace(/–/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

// ------------------------------
// 3. Build distractor pool by sport + category
// ------------------------------
function buildPools(rows) {
  const pools = {};

  for (const row of rows) {
    const key = `${row.sport}::${row.category_tag}`;
    if (!pools[key]) pools[key] = [];
    pools[key].push(row);
  }

  return pools;
}

// ------------------------------
// 4. Generate distractors for a question
// ------------------------------
function generateDistractors(row, pools, allRows) {
  const key = `${row.sport}::${row.category_tag}`;
  const pool = pools[key] || [];

  const correct = normalizeAnswer(row.answer);

  // Filter out the correct answer
  let candidates = pool.filter(
    (r) => normalizeAnswer(r.answer) !== correct
  );

  // If we have fewer than 3 candidates, fallback to sport-only pool
  if (candidates.length < 3) {
    candidates = allRows.filter(
      (r) =>
        r.sport === row.sport &&
        normalizeAnswer(r.answer) !== correct
    );
  }

  // Still not enough? Fallback to ANY question
  if (candidates.length < 3) {
    candidates = allRows.filter(
      (r) => normalizeAnswer(r.answer) !== correct
    );
  }

  // Pick 3 random distractors
  const shuffled = candidates.sort(() => Math.random() - 0.5);
  const distractors = shuffled.slice(0, 3).map((r) => r.answer);

  return distractors;
}

// ------------------------------
// 5. Shuffle choices
// ------------------------------
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

// ------------------------------
// 6. Transform all rows
// ------------------------------
function transform(rows) {
  const pools = buildPools(rows);

  return rows.map((row) => {
    const correct = row.answer;
    const distractors = generateDistractors(row, pools, rows);
    const choices = shuffle([correct, ...distractors]);

    return {
      id: row.id,
      sport: row.sport,
      question: row.question,
      correct_answer: correct,
      choices,
      difficulty: row.difficulty,
      points: row.points,
      category_tag: row.category_tag,
    };
  });
}

// ------------------------------
// 7. Save output CSV
// ------------------------------
function saveCSV(rows, outputPath) {
  const flatRows = rows.map((r) => ({
    id: r.id,
    sport: r.sport,
    question: r.question,
    correct_answer: r.correct_answer,
    choice_a: r.choices[0],
    choice_b: r.choices[1],
    choice_c: r.choices[2],
    choice_d: r.choices[3],
    difficulty: r.difficulty,
    points: r.points,
    category_tag: r.category_tag,
  }));

  const csv = Papa.unparse(flatRows);
  fs.writeFileSync(outputPath, csv, "utf8");
}

// ------------------------------
// 8. Main
// ------------------------------
function main() {
  const input = path.join(__dirname, "sports_trivia.csv");
  const output = path.join(__dirname, "sports_trivia_mc.csv");

  const rows = loadCSV(input);
  const transformed = transform(rows);
  saveCSV(transformed, output);

  console.log("Multiple-choice CSV generated:", output);
}

main();
