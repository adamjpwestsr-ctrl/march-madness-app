'use client';

import { useEffect, useState } from 'react';
import OpeningRound from '@/components/bracket/OpeningRound';
import { RoundOf64 } from "@/components/bracket/RoundOf64";
import { RoundOf32 } from "@/components/bracket/RoundOf32";
import { Sweet16 } from "@/components/bracket/Sweet16";
import { Elite8 } from "@/components/bracket/Elite8";
import { FinalFour } from "@/components/bracket/FinalFour";
import { Championship } from "@/components/bracket/Championship";

export default function BracketPage() {
  const [bracket, setBracket] = useState(null);
  const [picks, setPicks] = useState({}); // gameId → teamId

  useEffect(() => {
    fetch('/api/bracket/generate')
      .then(res => res.json())
      .then(setBracket);
  }, []);

  function handlePick(gameId, teamId) {
    setPicks(prev => ({
      ...prev,
      [gameId]: teamId
    }));
  }

  async function submitBracket() {
    const res = await fetch('/api/bracket/submit', {
      method: 'POST',
      body: JSON.stringify({ picks }),
      headers: { 'Content-Type': 'application/json' }
    });

    if (res.ok) {
      alert('Bracket submitted!');
    }
  }

  if (!bracket) return <div>Loading bracket…</div>;

  return (
    <div className="bracket-container">
      <h1>2027 Tournament Bracket</h1>

      <OpeningRound games={bracket.openingRound} picks={picks} onPick={handlePick} />
      <RoundOf64 games={bracket.roundOf64} picks={picks} onPick={handlePick} />
      <RoundOf32 games={bracket.roundOf32} picks={picks} onPick={handlePick} />
      <Sweet16 games={bracket.sweet16} picks={picks} onPick={handlePick} />
      <Elite8 games={bracket.elite8} picks={picks} onPick={handlePick} />
      <Final4 games={bracket.final4} picks={picks} onPick={handlePick} />
      <Championship games={bracket.championship} picks={picks} onPick={handlePick} />

      <button className="submit-bracket" onClick={submitBracket}>
        Submit Bracket
      </button>
    </div>
  );
}
