"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Papa from "papaparse";

/* -------------------- Types -------------------- */
interface TriviaQuestion {
  id: number;
  question: string;
  answer: string;
  difficulty: string;
  points: number;
}

export default function TriviaAdminPage() {
  const [sport, setSport] = useState("");
  const [sports, setSports] = useState<string[]>([]);
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [tab, setTab] = useState("questions"); // questions | feedback | leaderboard | import

  // Form fields
  const [newQ, setNewQ] = useState("");
  const [newA, setNewA] = useState("");
  const [newDifficulty, setNewDifficulty] = useState("medium");
  const [newPoints, setNewPoints] = useState(10);

  const [message, setMessage] = useState<string | null>(null);

  // CSV Import
  const [file, setFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [importLoading, setImportLoading] = useState(false);

  /* -------------------- Load Sports -------------------- */
  useEffect(() => {
    async function loadSports() {
      const res = await fetch("/api/trivia/sports");
      const json = await res.json();
      setSports(json.sports || []);
    }
    loadSports();
  }, []);

  /* -------------------- Load Questions -------------------- */
  useEffect(() => {
    if (!sport || tab !== "questions") return;

    async function loadQuestions() {
      setLoading(true);
      const res = await fetch(`/api/trivia/questions?sport=${sport}`);
      const json = await res.json();
      setQuestions(json.questions || []);
      setLoading(false);
    }

    loadQuestions();
  }, [sport, tab]);

  /* -------------------- Load Feedback -------------------- */
  useEffect(() => {
    if (tab !== "feedback") return;

    async function loadFeedback() {
      const res = await fetch("/api/trivia/feedback");
      const json = await res.json();
      setFeedback(json.feedback || []);
    }

    loadFeedback();
  }, [tab]);

  /* -------------------- Add Question -------------------- */
  async function handleAddQuestion(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);

    const res = await fetch("/api/trivia/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sport,
        question: newQ,
        answer: newA,
        difficulty: newDifficulty,
        points: newPoints,
      }),
    });

    if (res.ok) {
      setMessage("Question added successfully!");
      setNewQ("");
      setNewA("");
      setNewDifficulty("medium");
      setNewPoints(10);
    } else {
      setMessage("Error adding question.");
    }
  }

  /* -------------------- Clear Leaderboard -------------------- */
  async function clearLeaderboard() {
    const res = await fetch("/api/trivia/leaderboard", {
      method: "DELETE",
    });

    if (res.ok) {
      setMessage("Leaderboard cleared!");
    } else {
      setMessage("Error clearing leaderboard.");
    }
  }

  /* -------------------- CSV File Select + Preview -------------------- */
  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] || null;
    setFile(selected);

    if (!selected) {
      setPreviewRows([]);
      return;
    }

    const text = await selected.text();

    const { data, errors, meta } = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
    });

    if (errors.length > 0) {
      alert("CSV parse error — check formatting.");
      console.error(errors);
      return;
    }

    setPreviewHeaders(meta.fields || []);
    setPreviewRows(data);
  }

  /* -------------------- Import CSV to API -------------------- */
  async function handleImportCSV() {
    if (!file || !sport) return;

    setMessage(null);
    setImportLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("sport", sport);

    const res = await fetch("/api/trivia/import", {
      method: "POST",
      body: formData,
    });

    const json = await res.json();

    if (res.ok) {
      setMessage(`Imported ${json.imported} rows. Skipped ${json.skipped}.`);
    } else {
      setMessage(json.error || "Import failed.");
    }

    setImportLoading(false);
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 py-20 px-6 flex flex-col items-center">

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-5xl font-extrabold text-white drop-shadow-[0_0_25px_rgba(16,185,129,1)] mb-12 tracking-wide"
      >
        Trivia Admin Panel
      </motion.h1>

      {/* Tabs */}
      <div className="flex gap-6 mb-12">
        {["questions", "feedback", "leaderboard", "import"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`
              px-6 py-3 rounded-xl text-lg font-bold transition-all duration-300
              ${tab === t
                ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-[0_0_25px_rgba(16,185,129,1)]"
                : "bg-slate-800 text-slate-400 hover:text-white hover:shadow-[0_0_15px_rgba(16,185,129,0.7)]"
              }
            `}
          >
            {t === "questions" && "Questions"}
            {t === "feedback" && "Feedback"}
            {t === "leaderboard" && "Leaderboard"}
            {t === "import" && "CSV Import"}
          </button>
        ))}
      </div>

      {/* Status Message */}
      {message && (
        <div className="mb-6 text-emerald-400 font-bold drop-shadow-[0_0_15px_rgba(16,185,129,1)]">
          {message}
        </div>
      )}

      {/* -------------------- QUESTIONS TAB -------------------- */}
      {tab === "questions" && (
        <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-xl p-10 shadow-xl">

          {/* Sport Selector */}
          <FormSection label="Select Sport">
            <NeonDropdown
              value={sport}
              onChange={setSport}
              options={sports.map((s) => ({ value: s, label: s }))}
            />
          </FormSection>

          {/* Add Question Form */}
          {sport && (
            <form onSubmit={handleAddQuestion} className="mt-10">
              <FormSection label="Question">
                <input
                  type="text"
                  required
                  value={newQ}
                  onChange={(e) => setNewQ(e.target.value)}
                  className="w-full bg-slate-800 text-white p-3 rounded-lg border border-slate-700 focus:border-emerald-500 outline-none"
                />
              </FormSection>

              <FormSection label="Answer">
                <input
                  type="text"
                  required
                  value={newA}
                  onChange={(e) => setNewA(e.target.value)}
                  className="w-full bg-slate-800 text-white p-3 rounded-lg border border-slate-700 focus:border-emerald-500 outline-none"
                />
              </FormSection>

              <FormSection label="Difficulty">
                <NeonDropdown
                  value={newDifficulty}
                  onChange={setNewDifficulty}
                  options={[
                    { value: "easy", label: "Easy" },
                    { value: "medium", label: "Medium" },
                    { value: "hard", label: "Hard" },
                  ]}
                />
              </FormSection>

              <FormSection label="Points">
                <input
                  type="number"
                  required
                  value={newPoints}
                  onChange={(e) => setNewPoints(Number(e.target.value))}
                  className="w-32 bg-slate-800 text-white p-3 rounded-lg border border-slate-700 focus:border-emerald-500 outline-none"
                />
              </FormSection>

              <div className="mt-10 flex justify-center">
                <button
                  type="submit"
                  className="
                    px-10 py-4 text-2xl font-bold rounded-xl
                    bg-gradient-to-r from-emerald-500 to-cyan-500
                    text-white shadow-[0_0_35px_rgba(16,185,129,1)]
                    hover:shadow-[0_0_55px_rgba(16,185,129,1)]
                    transition-all duration-300
                  "
                >
                  Add Question
                </button>
              </div>
            </form>
          )}

          {/* Questions List */}
          {sport && !loading && questions.length > 0 && (
            <div className="mt-12">
              <h2 className="text-white text-2xl font-bold mb-4">Existing Questions</h2>
              <div className="space-y-4">
                {questions.map((q) => (
                  <div
                    key={q.id}
                    className="bg-slate-800 p-4 rounded-lg border border-slate-700 text-slate-300"
                  >
                    <div className="font-bold text-white">{q.question}</div>
                    <div className="text-emerald-400">Answer: {q.answer}</div>
                    <div className="text-cyan-400">Difficulty: {q.difficulty}</div>
                    <div className="text-purple-400">Points: {q.points}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* -------------------- FEEDBACK TAB -------------------- */}
      {tab === "feedback" && (
        <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-xl p-10 shadow-xl">
          <h2 className="text-white text-2xl font-bold mb-6">Player Feedback</h2>

          {feedback.length === 0 && (
            <div className="text-slate-400">No feedback submitted yet.</div>
          )}

          {feedback.length > 0 && (
            <div className="space-y-6">
              {feedback.map((f) => (
                <div
                  key={f.id}
                  className="bg-slate-800 p-6 rounded-lg border border-slate-700 text-slate-300"
                >
                  <div className="text-white font-bold mb-2">{f.email}</div>
                  <div className="mb-2">
                    <span className="text-emerald-400 font-bold">{f.type.toUpperCase()}</span>
                  </div>
                  <div className="mb-2">{f.body}</div>

                  {f.enhancement_requested && (
                    <div className="mt-3 text-cyan-400">
                      Enhancement: {f.enhancement_text}
                    </div>
                  )}

                  {f.shout_out && (
                    <div className="mt-2 text-purple-400 font-bold">
                      Wants a shout‑out!
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* -------------------- LEADERBOARD TAB -------------------- */}
      {tab === "leaderboard" && (
        <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-xl p-10 shadow-xl text-center">
          <h2 className="text-white text-2xl font-bold mb-6">Leaderboard Controls</h2>

          <button
            onClick={clearLeaderboard}
            className="
              px-10 py-4 text-2xl font-bold rounded-xl
              bg-gradient-to-r from-red-600 to-red-800
              text-white shadow-[0_0_35px_rgba(220,38,38,1)]
              hover:shadow-[0_0_55px_rgba(220,38,38,1)]
              transition-all duration-300
            "
          >
            Clear Leaderboard
          </button>
        </div>
      )}

      {/* -------------------- IMPORT TAB -------------------- */}
      {tab === "import" && (
        <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-xl p-10 shadow-xl">

          <h2 className="text-white text-2xl font-bold mb-6">
            Bulk Import Trivia Questions (CSV)
          </h2>

          {/* Sport Selector */}
          <FormSection label="Select Sport">
            <NeonDropdown
              value={sport}
              onChange={setSport}
              options={sports.map((s) => ({ value: s, label: s }))}
            />
          </FormSection>

          {/* CSV Upload */}
          <FormSection label="Upload CSV File">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="
                w-full bg-slate-800 text-white p-3 rounded-lg border border-slate-700
                focus:border-emerald-500 outline-none cursor-pointer
              "
            />
          </FormSection>

          {/* Preview */}
          {previewRows.length > 0 && (
            <div className="mb-6 max-h-64 overflow-auto border border-slate-700 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-slate-800 text-slate-300">
                  <tr>
                    {previewHeaders.map((h) => (
                      <th key={h} className="px-3 py-2 border-b border-slate-700">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, i) => (
                    <tr key={i} className="odd:bg-slate-900 even:bg-slate-800">
                      {previewHeaders.map((h) => (
                        <td key={h} className="px-3 py-2 border-b border-slate-800">
                          {row[h]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Import Button */}
          <button
            onClick={handleImportCSV}
            disabled={!file || !sport || importLoading}
            className="
              px-10 py-4 text-xl font-bold rounded-xl
              bg-gradient-to-r from-emerald-500 to-cyan-500
              text-white shadow-[0_0_35px_rgba(16,185,129,1)]
              hover:shadow-[0_0_55px_rgba(16,185,129,1)]
              transition-all duration-300
            "
          >
            {importLoading ? "Importing..." : "Import CSV"}
          </button>

        </div>
      )}

    </div>
  );
}

/* -------------------- Neon Dropdown Component -------------------- */

interface DropdownOption {
  value: string;
  label: string;
}

interface NeonDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
}

function NeonDropdown({ value, onChange, options }: NeonDropdownProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="
        w-full bg-slate-800 text-white p-3 rounded-lg border border-slate-700
        focus:border-emerald-500 outline-none cursor-pointer
        shadow-[0_0_15px_rgba(16,185,129,0.5)]
      "
    >
      <option value="">Select...</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}


/* -------------------- Form Section Component -------------------- */

function FormSection({ label, children }) {
  return (
    <div className="mb-8">
      <label className="block text-white text-xl font-bold mb-3 drop-shadow-[0_0_15px_rgba(16,185,129,0.7)]">
        {label}
      </label>
      {children}
    </div>
  );
}
