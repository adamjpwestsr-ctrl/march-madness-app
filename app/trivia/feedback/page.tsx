"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function TriviaFeedbackPage() {
  const [email, setEmail] = useState("");
  const [type, setType] = useState("issue"); // issue | feedback
  const [body, setBody] = useState("");
  const [enhancement, setEnhancement] = useState("no"); // yes | no
  const [enhancementText, setEnhancementText] = useState("");
  const [shoutout, setShoutout] = useState("no"); // yes | no

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/trivia/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          type,
          body,
          enhancement_requested: enhancement === "yes",
          enhancement_text: enhancement === "yes" ? enhancementText : null,
          shout_out: shoutout === "yes",
        }),
      });

      if (!res.ok) {
        throw new Error(`Feedback API returned ${res.status}`);
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Feedback submit error:", err);
      setError("Unable to submit feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-start py-20 px-6">

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-5xl font-extrabold text-white drop-shadow-[0_0_25px_rgba(16,185,129,1)] mb-10 tracking-wide text-center"
      >
        Trivia Feedback
      </motion.h1>

      {/* Intro Text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-slate-300 text-lg max-w-2xl text-center mb-12 leading-relaxed"
      >
        Sometimes we don’t get it right — call us out on it!  
        Did we mess up a question or answer? Was there a typo?  
        Or do you just love us so much you wanted to provide the best feedback?  
        Fill in the details below and we’ll get back to you!
      </motion.p>

      {/* Success Message */}
      {submitted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-emerald-900/30 border border-emerald-600 text-emerald-300 p-6 rounded-xl shadow-xl text-center max-w-xl"
        >
          Thank you! Your feedback has been submitted.
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 p-6 rounded-xl shadow-xl text-center max-w-xl mb-6">
          {error}
        </div>
      )}

      {!submitted && (
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-xl p-10 shadow-xl"
        >
          {/* Email */}
          <FormSection label="Email">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800 text-white p-3 rounded-lg border border-slate-700 focus:border-emerald-500 outline-none"
            />
          </FormSection>

          {/* Type */}
          <FormSection label="Is this an Issue or Feedback?">
            <RadioGroup
              name="type"
              value={type}
              onChange={setType}
              options={[
                { value: "issue", label: "Issue" },
                { value: "feedback", label: "Feedback" },
              ]}
            />
          </FormSection>

          {/* Body */}
          <FormSection label="Details">
            <textarea
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full bg-slate-800 text-white p-3 rounded-lg border border-slate-700 focus:border-emerald-500 outline-none h-32"
            />
          </FormSection>

          {/* Enhancement */}
          <FormSection label="Do you have any enhancements you’d like to see?">
            <RadioGroup
              name="enhancement"
              value={enhancement}
              onChange={setEnhancement}
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
            />
          </FormSection>

          {/* Enhancement Text */}
          {enhancement === "yes" && (
            <FormSection label="Describe your enhancement idea">
              <textarea
                value={enhancementText}
                onChange={(e) => setEnhancementText(e.target.value)}
                className="w-full bg-slate-800 text-white p-3 rounded-lg border border-slate-700 focus:border-cyan-500 outline-none h-28"
              />
            </FormSection>
          )}

          {/* Shout Out */}
          {enhancement === "yes" && (
            <FormSection label="Do you want a shout‑out if we implement your idea?">
              <RadioGroup
                name="shoutout"
                value={shoutout}
                onChange={setShoutout}
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
              />
            </FormSection>
          )}

          {/* Submit */}
          <div className="mt-10 flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="
                px-10 py-4 text-2xl font-bold rounded-xl
                bg-gradient-to-r from-emerald-500 to-cyan-500
                text-white shadow-[0_0_35px_rgba(16,185,129,1)]
                hover:shadow-[0_0_55px_rgba(16,185,129,1)]
                transition-all duration-300
                disabled:opacity-50
              "
            >
              {loading ? "Submitting..." : "Submit Feedback"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

/* --- Form Section Component --- */

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

/* --- Radio Group Component --- */

function RadioGroup({ name, value, onChange, options }) {
  return (
    <div className="flex gap-10">
      {options.map((opt) => (
        <label
          key={opt.value}
          className="flex items-center gap-3 text-slate-300 cursor-pointer hover:text-white transition"
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className="w-5 h-5 accent-emerald-500 cursor-pointer"
          />
          <span className="text-lg">{opt.label}</span>
        </label>
      ))}
    </div>
  );
}
