"use client";

export default function BracketIconSelector({
  bracketId,
  currentIcon,
}: {
  bracketId: string;
  currentIcon: string | null;
}) {
  return (
    <form action="/bracket/actions/updateBracketIcon">
      <input type="hidden" name="bracketId" value={bracketId} />

      <select
        name="icon"
        defaultValue={currentIcon || "🏀"}
        className="bg-slate-900 text-sm rounded px-1 py-0.5"
        onChange={(e) => e.target.form?.requestSubmit()}
      >
        <option value="🏀">🏀</option>
        <option value="🔥">🔥</option>
        <option value="🎯">🎯</option>
        <option value="⭐">⭐</option>
        <option value="💰">💰</option>
        <option value="🐺">🐺</option>
        <option value="🐯">🐯</option>
        <option value="🐻">🐻</option>
        <option value="🦅">🦅</option>
        <option value="🐉">🐉</option>
      </select>
    </form>
  );
}
