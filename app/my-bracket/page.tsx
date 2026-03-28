'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function MyBracket() {
  const [locked, setLocked] = useState(false)
  const [picks, setPicks] = useState<any[]>([])

  useEffect(() => {
    checkLock()
    loadPicks()
  }, [])

  const checkLock = async () => {
    // Get tournament lock time
    const { data: settings } = await supabase
      .from('tournament_settings')
      .select('lock_time')
      .single()

    if (!settings?.lock_time) {
      setLocked(false)
      return
    }

    const now = new Date()
    const lockTime = new Date(settings.lock_time)

    if (now > lockTime) {
      setLocked(true)
    }
  }

  const loadPicks = async () => {
    const { data } = await supabase
      .from('picks')
      .select('game_id, selected_team, points_awarded')
      .eq('user_id', 1) // TODO: replace with auth

    setPicks(data ?? [])
  }

  if (locked) {
    return <p style={{ padding: 20 }}>Bracket is locked.</p>
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
