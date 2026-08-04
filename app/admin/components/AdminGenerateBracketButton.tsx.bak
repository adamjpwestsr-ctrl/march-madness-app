"use client";

import { useState } from "react";

export default function AdminGenerateBracketButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/bracket/generate", {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ ${data.message} (${data.gamesInserted} games inserted)`);
      } else {
        setMessage(`❌ ${data.error || "Bracket generation failed"}`);
      }
    } catch (err: any) {
      setMessage(`❌ Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate Bracket"}
      </button>
      {message && (
        <p
          className={`text-sm ${
            message.startsWith("✅") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
