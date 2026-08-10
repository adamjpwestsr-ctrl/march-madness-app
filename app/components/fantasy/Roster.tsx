// components/Fantasy/Roster.tsx
"use client";

export default function Roster({ roster, onRemove }) {
  return (
    <div className="p-4 bg-gray-900 rounded-lg shadow-lg">
      <h2 className="text-white text-xl mb-4">Your Roster</h2>

      {roster.length === 0 && (
        <div className="text-gray-400">No players selected yet.</div>
      )}

      <div className="space-y-2">
        {roster.map((p) => (
          <div
            key={p.id}
            className="flex justify-between items-center p-3 bg-gray-800 rounded"
          >
            <div>
              <div className="text-white font-semibold">{p.name}</div>
              <div className="text-gray-400 text-sm">
                {p.team} • {p.position}
              </div>
            </div>

            <button
              className="px-3 py-1 bg-red-600 text-white rounded"
              onClick={() => onRemove(p.id)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
