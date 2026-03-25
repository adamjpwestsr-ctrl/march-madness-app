'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function MyBracket() {
const [locked, setLocked] = useState(false)

useEffect(() => {
  checkLock()
}, [])

const checkLock = async () => {
  const { data } = await supabase
    .from('tournament_settings')
    .select('lock_time')
    .single()

  if (new Date() > new Date(data.lock_time)) {
    setLocked(true)
  }
}

if (locked) return <p>Bracket is locked.</p>

  const [picks, setPicks] = useState([])

  useEffect(() => {
    loadPicks()
  }, [])

  const loadPicks = async () => {
    const { data } = await supabase
      .from('picks')
      .select('game_id, selected_team, points_awarded')
      .eq('user_id', 1) // replace with auth later

    setPicks(data ?? [])
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>My Bracket</h1>

      {picks.map(p => (
        <div key={p.game_id} style={{ marginBottom: '10px' }}>
          Game {p.game_id}: {p.selected_team} ({p.points_awarded} pts)
        </div>
      ))}
    </div>
  )
}
