'use client'

import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export default function Home() {
  const [games, setGames] = useState([])
  const [picks, setPicks] = useState({})

  useEffect(() => {
    fetchGames()
  }, [])

  const fetchGames = async () => {
    const { data } = await supabase
      .from('games')
      .select('*')
      .eq('round', 1)
      .order('game_id')

    setGames(data)
  }

  const handlePick = (gameId, team) => {
    setPicks(prev => ({
      ...prev,
      [gameId]: team
    }))
  }

  const submitBracket = async () => {
    const userId = 1 // TEMP (we'll fix auth later)

    const picksArray = Object.entries(picks).map(([gameId, team]) => ({
      user_id: userId,
      game_id: parseInt(gameId),
      selected_team: team
    }))

    await supabase.from('picks').insert(picksArray)

    alert('Bracket submitted!')
  }

  return (
    <div>
      <h1>March Madness Bracket</h1>

      {games.map(game => (
        <div key={game.game_id} style={{ marginBottom: '20px' }}>
          <button onClick={() => handlePick(game.game_id, game.team1)}>
            {game.seed1} {game.team1}
          </button>

          <button onClick={() => handlePick(game.game_id, game.team2)}>
            {game.seed2} {game.team2}
          </button>
        </div>
      ))}

      <button onClick={submitBracket}>
        Submit Bracket
      </button>
    </div>
  )
}