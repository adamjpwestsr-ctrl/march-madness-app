'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'

export default function AdminPage() {
  const [games, setGames] = useState([])
  const [selectedGame, setSelectedGame] = useState(null)
  const [winner, setWinner] = useState(null)

  useEffect(() => {
    loadGames()
  }, [])

  const loadGames = async () => {
    const { data } = await supabase
      .from('games')
      .select('*')
      .order('game_id')

    setGames(data ?? [])
  }

  const submitWinner = async () => {
    if (!selectedGame || !winner) return

    await supabase.rpc('set_game_winner', {
      gameid: selectedGame,
      winningteam: winner
    })

    await supabase.rpc('run_game_scoring')

    alert('Winner updated and scoring recalculated!')
    loadGames()
  }

  const game = games.find(g => g.game_id === selectedGame)

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ marginBottom: 20 }}>Admin: Set Game Winners</h1>

      {/* GAME SELECT DROPDOWN */}
      <select
        onChange={(e) => {
          setSelectedGame(Number(e.target.value))
          setWinner(null)
        }}
        style={{
          color: '#0f172a',
          background: 'white',
          padding: '8px',
          borderRadius: 6,
          border: '1px solid #cbd5e1'
        }}
      >
        <option value="">Select Game</option>
        {games.map(g => (
          <option
            key={g.game_id}
            value={g.game_id}
            style={{ color: '#0f172a' }}
          >
            Game {g.game_id}: {g.team1} vs {g.team2}
          </option>
        ))}
      </select>

      {/* GAME DETAILS PANEL */}
      {game && (
        <div
          style={{
            marginTop: 20,
            padding: 16,
            background: '#0f172a',
            borderRadius: 8,
            border: '1px solid #334155',
            color: '#e2e8f0'
          }}
        >
          <h3 style={{ marginBottom: 10 }}>Game Details</h3>

          <p><strong>Region:</strong> {game.region}</p>
          <p><strong>Round:</strong> {game.round}</p>
          <p><strong>Game Number:</strong> {game.game_number}</p>

          <p style={{ marginTop: 10 }}>
            <strong>Teams:</strong><br />
            {game.team1} (Seed {game.seed1})<br />
            {game.team2} (Seed {game.seed2})
          </p>

          <p style={{ marginTop: 10 }}>
            <strong>Current Winner:</strong>{' '}
            {game.winner ? game.winner : 'None'}
          </p>

          <p style={{ marginTop: 10 }}>
            <strong>Source Games:</strong><br />
            {game.source_game1
              ? `Winner of Game ${game.source_game1}`
              : '—'}
            <br />
            {game.source_game2
              ? `Winner of Game ${game.source_game2}`
              : '—'}
          </p>
        </div>
      )}

      {/* WINNER SELECTION BUTTONS */}
      {game && (
        <div style={{ marginTop: 20 }}>
          <h3>Pick Winner</h3>

          <p style={{ marginBottom: 10 }}>
            Current Winner:{' '}
            <strong>{game.winner ?? 'None'}</strong>
          </p>

          <button
            onClick={() => setWinner(game.team1)}
            style={{
              padding: '8px 16px',
              marginRight: 10,
              background: winner === game.team1 ? '#16A34A' : '#1E293B',
              color: 'white',
              borderRadius: 6,
              border: '1px solid #334155'
            }}
          >
            {game.team1}
          </button>

          <button
            onClick={() => setWinner(game.team2)}
            style={{
              padding: '8px 16px',
              background: winner === game.team2 ? '#16A34A' : '#1E293B',
              color: 'white',
              borderRadius: 6,
              border: '1px solid #334155'
            }}
          >
            {game.team2}
          </button>
        </div>
      )}

      {/* SUBMIT BUTTON */}
      <button
        onClick={submitWinner}
        disabled={!winner}
        style={{
          marginTop: 20,
          padding: '10px 20px',
          background: winner ? '#16A34A' : '#64748B',
          color: 'white',
          borderRadius: 8,
          border: 'none',
          cursor: winner ? 'pointer' : 'not-allowed'
        }}
      >
        Submit Winner
      </button>
    </div>
  )
}
