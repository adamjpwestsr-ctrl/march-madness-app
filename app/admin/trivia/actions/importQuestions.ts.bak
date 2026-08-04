"use server";

import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function importQuestions(file: File) {
  const supabase = await createSupabaseServerClient();

  const text = await file.text();
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);

  if (lines.length <= 1) {
    return { ok: false, message: "CSV appears to be empty." };
  }

  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const required = ["sport", "question", "answer", "difficulty", "points", "category tag"];

  const missing = required.filter(
    (col) => !header.some((h) => h === col || h === col.replace(" ", "_"))
  );

  if (missing.length > 0) {
    return { ok: false, message: `Missing columns: ${missing.join(", ")}` };
  }

  const sportIdx = header.findIndex(
    (h) => h === "sport"
  );
  const questionIdx = header.findIndex(
    (h) => h === "question"
  );
  const answerIdx = header.findIndex(
    (h) => h === "answer"
  );
  const difficultyIdx = header.findIndex(
    (h) => h === "difficulty"
  );
  const pointsIdx = header.findIndex(
    (h) => h === "points"
  );
  const categoryIdx = header.findIndex(
    (h) => h === "category tag" || h === "category_tag"
  );

  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const raw = lines[i];
    if (!raw.trim()) continue;

    const cols = raw.split(","); // simple CSV; if you have commas in text, we can upgrade later

    const sport = cols[sportIdx]?.trim();
    const question = cols[questionIdx]?.trim();
    const answer = cols[answerIdx]?.trim();
    const difficulty = cols[difficultyIdx]?.trim();
    const pointsStr = cols[pointsIdx]?.trim();
    const categoryTag = categoryIdx >= 0 ? cols[categoryIdx]?.trim() || null : null;

    if (!sport || !question || !answer || !difficulty || !pointsStr) continue;

    const points = Number(pointsStr);
    if (!Number.isFinite(points)) continue;

    rows.push({
      sport,
      question,
      answer,
      difficulty,
      points,
      category_tag: categoryTag,
    });
  }

  if (rows.length === 0) {
    return { ok: false, message: "No valid rows found in CSV." };
  }

  const { error } = await supabase.from("trivia_questions").insert(rows);

  if (error) {
    return { ok: false, message: "Failed to insert questions." };
  }

  return { ok: true, message: `Imported ${rows.length} questions.` };
}
