'use client';

import { useSearchParams } from 'next/navigation';
import { MarchMadnessClient } from '@/components/march-madness/MarchMadnessClient';

export default function MarchMadnessBracketV2Page() {
  const params = useSearchParams();
  const bracketId = params.get('bracket_id');

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <MarchMadnessClient bracketId={bracketId ?? undefined} />
    </div>
  );
}
