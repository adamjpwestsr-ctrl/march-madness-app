"use client";

import React, { useEffect, useState } from "react";

export default function BracketShell({
  bracketId,
  userId,
  userEmail,
  bracketName,
}: {
  bracketId: string;
  userId: number;
  userEmail: string;
  bracketName: string;
}) {
  const [loading, setLoading] = useState(true);
  const [bracket, setBracket] = useState<any>(null);

  useEffect(() => {
    async function loadBracket() {
      try {
        const res = await fetch(`/api/bracket?bid=${bracketId}`);
        const json = await res.json();
        setBracket(json);
      } catch (err) {
        console.error("Bracket load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadBracket();
  }, [bracketId]);

  if (loading) {
    return (
      <div className="text-slate-300 text-lg">
        Loading bracket…
      </div>
    );
  }

  if (!bracket) {
    return (
      <div className="text-red-400 text-lg">
        Failed to load bracket.
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-xl">
      <h2 className="text-xl font-bold mb-4">
        {bracketName}
      </h2>

      {/* Placeholder for your bracket UI */}
      <div className="text-slate-300">
        {/* Replace with your actual bracket rendering */}
        <pre className="text-xs bg-slate-800 p-4 rounded">
          {JSON.stringify(bracket, null, 2)}
        </pre>
      </div>
    </div>
  );
}
