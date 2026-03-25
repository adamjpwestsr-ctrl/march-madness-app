'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'

type User = {
  user_id: number
  name: string
}

type Game = {
  game_id: number
  round: number
  region: string
  game_number: number
  team1: string | null
  seed1: number | null
  team2: string | null
  seed2: number | null
  winner?: string | null
  source_game1?: number | null
  source_game2?: number | null
}

type PicksByGameId = Record<number, string>

type AdminBracketEditorProps = {
  games: Game[]
  picksByGameId: PicksByGameId
  onPickChange: (gameId: number, selectedTeam: string) => void
  tiebreaker: number | null
  onTiebreakerChange: (value: string) => void
}

const REGION_ORDER = ['East', 'West', 'South', 'Midwest', 'Final Four', 'Championship']

const ROUND_LABELS: Record<number, string> = {
  1: 'Round of 64',
  2: 'Round of 32',
  3: 'Sweet 16',
  4: 'Elite 8',
  5: 'Final Four',
  6: 'Championship'
}

export default function AdminEditBracketPage() {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [games, setGames] = useState<Game[]>([])
  const [picksByGameId, setPicksByGameId] = useState<PicksByGameId>({})
  const [tiebreaker, setTiebreaker] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchUsers()
    fetchGames()
  }, [])

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('user_id, name')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching users:', error)
      return
    }

    setUsers(data as User[])
  }

  const fetchGames = async () => {
    const { data, error } = await supabase
      .from('games')
      .select(
        'game_id, round, region, game_number, team1, seed1, team2, seed2, winner, source_game1, source_game2'
      )
      .order('round', { ascending: true })
      .order('region', { ascending: true })
      .order('game_number', { ascending: true })

    if (error) {
      console.error('Error fetching games:', error)
      return
    }

    setGames(data as Game[])
  }

  const loadBracketForUser = async (userId: number) => {
    setLoading(true)

    const { data: picks, error: picksError } = await supabase
      .from('picks')
      .select('game_id, selected_team')
      .eq('user_id', userId)

    if (picksError) {
      console.error('Error fetching picks:', picksError)
      setLoading(false)
      return
    }

    const picksMap: PicksByGameId = {}
    ;(picks ?? []).forEach(p => {
      picksMap[p.game_id] = p.selected_team
    })

    setPicksByGameId(picksMap)

    const { data: bracketRow, error: bracketError } = await supabase
      .from('bracket_submissions')
      .select('tiebreaker')
      .eq('user_id', userId)
      .maybeSingle()

    if (bracketError && bracketError.code !== 'PGRST116') {
      console.error('Error fetching tiebreaker:', bracketError)
    }

    setTiebreaker(bracketRow?.tiebreaker ?? null)
    setLoading(false)
  }

  const handleUserChange = (value: string) => {
    const id = value ? parseInt(value, 10) : null
    setSelectedUserId(id)
    setPicksByGameId({})
    setTiebreaker(null)
    if (id) {
      loadBracketForUser(id)
    }
  }

  const handlePickChange = (gameId: number, selectedTeam: string) => {
    setPicksByGameId(prev => ({
      ...prev,
      [gameId]: selectedTeam
    }))
  }

  const handleTiebreakerChange = (value: string) => {
    if (value === '') {
      setTiebreaker(null)
      return
    }
    const num = parseInt(value, 10)
    if (!Number.isNaN(num)) {
      setTiebreaker(num)
    }
  }

  const simulateRandomBracket = () => {
    if (!games || games.length === 0 || !selectedUserId) return

    const newPicks: PicksByGameId = {}

    games.forEach(game => {
      const teams = [game.team1, game.team2].filter(Boolean)
      if (teams.length > 0) {
        const randomTeam = teams[Math.floor(Math.random() * teams.length)]!
        newPicks[game.game_id] = randomTeam
      }
    })

    const randomTiebreaker = Math.floor(120 + Math.random() * 60)

    setPicksByGameId(newPicks)
    setTiebreaker(randomTiebreaker)
  }

  const simulateChalkBracket = () => {
    if (!games || games.length === 0 || !selectedUserId) return

    const newPicks: PicksByGameId = {}

    games.forEach(game => {
      const { team1, team2, seed1, seed2 } = game

      if (!team1 && !team2) return

      if (seed1 != null && seed2 != null) {
        if (seed1 < seed2) {
          if (team1) newPicks[game.game_id] = team1
        } else if (seed2 < seed1) {
          if (team2) newPicks[game.game_id] = team2
        } else {
          const teams = [team1, team2].filter(Boolean) as string[]
          if (teams.length > 0) {
            const randomTeam = teams[Math.floor(Math.random() * teams.length)]
            newPicks[game.game_id] = randomTeam
          }
        }
      } else {
        const teams = [team1, team2].filter(Boolean) as string[]
        if (teams.length > 0) {
          const randomTeam = teams[Math.floor(Math.random() * teams.length)]
          newPicks[game.game_id] = randomTeam
        }
      }
    })

    const randomTiebreaker = Math.floor(130 + Math.random() * 40)

    setPicksByGameId(newPicks)
    setTiebreaker(randomTiebreaker)
  }

  const simulateUpsetBracket = () => {
    if (!games || games.length === 0 || !selectedUserId) return

    const newPicks: PicksByGameId = {}

    games.forEach(game => {
      const { team1, team2, seed1, seed2 } = game
      if (!team1 && !team2) return

      if (seed1 != null && seed2 != null && team1 && team2) {
        const s1 = seed1
        const s2 = seed2

        const weight1 = 1 / s1
        const weight2 = 1 / s2
        const total = weight1 + weight2

        const p1 = weight1 / total
        const roll = Math.random()

        const winner = roll < p1 ? team1 : team2
        newPicks[game.game_id] = winner
      } else {
        const teams = [team1, team2].filter(Boolean) as string[]
        if (teams.length > 0) {
          const randomTeam = teams[Math.floor(Math.random() * teams.length)]
          newPicks[game.game_id] = randomTeam
        }
      }
    })

    const randomTiebreaker = Math.floor(140 + Math.random() * 30)

    setPicksByGameId(newPicks)
    setTiebreaker(randomTiebreaker)
  }

  const simulatePerfectBracket = () => {
    if (!games || games.length === 0 || !selectedUserId) return

    const newPicks: PicksByGameId = {}

    games.forEach(game => {
      const { winner, team1, team2, seed1, seed2 } = game

      if (winner) {
        newPicks[game.game_id] = winner
        return
      }

      if (seed1 != null && seed2 != null) {
        if (seed1 < seed2 && team1) {
          newPicks[game.game_id] = team1
        } else if (seed2 < seed1 && team2) {
          newPicks[game.game_id] = team2
        } else {
          const teams = [team1, team2].filter(Boolean) as string[]
          if (teams.length > 0) {
            const randomTeam = teams[Math.floor(Math.random() * teams.length)]
            newPicks[game.game_id] = randomTeam
          }
        }
      } else {
        const teams = [team1, team2].filter(Boolean) as string[]
        if (teams.length > 0) {
          const randomTeam = teams[Math.floor(Math.random() * teams.length)]
          newPicks[game.game_id] = randomTeam
        }
      }
    })

    const randomTiebreaker = Math.floor(130 + Math.random() * 40)

    setPicksByGameId(newPicks)
    setTiebreaker(randomTiebreaker)
  }

  const handleSave = async () => {
    if (!selectedUserId) return
    setSaving(true)

    try {
      const { error: deleteError } = await supabase
        .from('picks')
        .delete()
        .eq('user_id', selectedUserId)

      if (deleteError) {
        console.error('Error deleting picks:', deleteError)
        setSaving(false)
        return
      }

      const picksToInsert = Object.entries(picksByGameId)
        .filter(([, team]) => !!team)
        .map(([gameId, team]) => ({
          user_id: selectedUserId,
          game_id: Number(gameId),
          selected_team: team,
          points_awarded: 0
        }))

      if (picksToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('picks')
          .insert(picksToInsert)

        if (insertError) {
          console.error('Error inserting picks:', insertError)
          setSaving(false)
          return
        }
      }

      const { error: upsertError } = await supabase
        .from('bracket_submissions')
        .upsert(
          {
            user_id: selectedUserId,
            tiebreaker: tiebreaker
          },
          { onConflict: 'user_id' }
        )

      if (upsertError) {
        console.error('Error upserting tiebreaker:', upsertError)
        setSaving(false)
        return
      }
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    if (!selectedUserId) return
    setSaving(true)

    try {
      const { error: deletePicksError } = await supabase
        .from('picks')
        .delete()
        .eq('user_id', selectedUserId)

      if (deletePicksError) {
        console.error('Error deleting picks:', deletePicksError)
        setSaving(false)
        return
      }

      const { error: deleteBracketError } = await supabase
        .from('bracket_submissions')
        .delete()
        .eq('user_id', selectedUserId)

      if (deleteBracketError) {
        console.error('Error deleting bracket_submissions:', deleteBracketError)
        setSaving(false)
        return
      }

      setPicksByGameId({})
      setTiebreaker(null)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      style={{
        padding: 30,
        background: '#0f172a',
        minHeight: '100vh',
        color: '#e5e7eb'
      }}
    >
      <h1
        style={{
          marginBottom: 20,
          fontSize: 26,
          fontWeight: 700
        }}
      >
        Admin · Edit Bracket
      </h1>

      {/* ROW 1 — CORE ACTIONS */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          marginBottom: 12
        }}
      >
        <select
          value={selectedUserId ?? ''}
          onChange={e => handleUserChange(e.target.value)}
          style={{
            padding: '8px 10px',
            borderRadius: 8,
            border: '1px solid #334155',
            background: '#020617',
            color: '#e5e7eb',
            minWidth: 220
          }}
        >
          <option value="">Select user…</option>
          {users.map(u => (
            <option key={u.user_id} value={u.user_id}>
              {u.name}
            </option>
          ))}
        </select>

        <button
          onClick={() => selectedUserId && loadBracketForUser(selectedUserId)}
          disabled={!selectedUserId || loading}
          style={{
            padding: '8px 14px',
            background: '#1d4ed8',
            color: 'white',
            borderRadius: 8,
            border: 'none',
            cursor: selectedUserId ? 'pointer' : 'not-allowed',
            opacity: selectedUserId ? 1 : 0.5,
            fontSize: 14
          }}
        >
          {loading ? 'Loading…' : 'Reload Bracket'}
        </button>

        <button
          onClick={handleSave}
          disabled={!selectedUserId || saving}
          style={{
            padding: '8px 14px',
            background: '#16a34a',
            color: 'white',
            borderRadius: 8,
            border: 'none',
            cursor: selectedUserId ? 'pointer' : 'not-allowed',
            opacity: selectedUserId ? 1 : 0.5,
            fontSize: 14
          }}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>

        <button
          onClick={handleReset}
          disabled={!selectedUserId || saving}
          style={{
            padding: '8px 14px',
            background: '#b91c1c',
            color: 'white',
            borderRadius: 8,
            border: 'none',
            cursor: selectedUserId ? 'pointer' : 'not-allowed',
            opacity: selectedUserId ? 1 : 0.5,
            fontSize: 14
          }}
        >
          Reset Bracket
        </button>
      </div>

      {/* ROW 2 — SIMULATION TOOLS */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          marginBottom: 24
        }}
      >
        <button
          onClick={simulateRandomBracket}
          disabled={!selectedUserId || loading}
          style={{
            padding: '8px 14px',
            background: '#7c3aed',
            color: 'white',
            borderRadius: 8,
            border: 'none',
            cursor: selectedUserId ? 'pointer' : 'not-allowed',
            opacity: selectedUserId ? 1 : 0.5,
            fontSize: 14
          }}
        >
          Simulate Random
        </button>

        <button
          onClick={simulateChalkBracket}
          disabled={!selectedUserId || loading}
          style={{
            padding: '8px 14px',
            background: '#4f46e5',
            color: 'white',
            borderRadius: 8,
            border: 'none',
            cursor: selectedUserId ? 'pointer' : 'not-allowed',
            opacity: selectedUserId ? 1 : 0.5,
            fontSize: 14
          }}
        >
          Simulate Chalk
        </button>

        <button
          onClick={simulateUpsetBracket}
          disabled={!selectedUserId || loading}
          style={{
            padding: '8px 14px',
            background: '#db2777',
            color: 'white',
            borderRadius: 8,
            border: 'none',
            cursor: selectedUserId ? 'pointer' : 'not-allowed',
            opacity: selectedUserId ? 1 : 0.5,
            fontSize: 14
          }}
        >
          Simulate Upsets
        </button>

        <button
          onClick={simulatePerfectBracket}
          disabled={!selectedUserId || loading}
          style={{
            padding: '8px 14px',
            background: '#059669',
            color: 'white',
            borderRadius: 8,
            border: 'none',
            cursor: selectedUserId ? 'pointer' : 'not-allowed',
            opacity: selectedUserId ? 1 : 0.5,
            fontSize: 14
          }}
        >
          Simulate Perfect
        </button>
      </div>

      {selectedUserId ? (
        <AdminBracketEditor
          games={games}
          picksByGameId={picksByGameId}
          onPickChange={handlePickChange}
          tiebreaker={tiebreaker}
          onTiebreakerChange={handleTiebreakerChange}
        />
      ) : (
        <p style={{ color: '#94a3b8' }}>Select a user to edit their bracket.</p>
      )}
    </div>
  )
}

function AdminBracketEditor({
  games,
  picksByGameId,
  onPickChange,
  tiebreaker,
  onTiebreakerChange
}: AdminBracketEditorProps) {
  const gamesByRegion: Record<string, Record<number, Game[]>> = {}
  const gameById: Record<number, Game> = {}

  games.forEach(game => {
    gameById[game.game_id] = game
    if (!gamesByRegion[game.region]) {
      gamesByRegion[game.region] = {}
    }
    if (!gamesByRegion[game.region][game.round]) {
      gamesByRegion[game.region][game.round] = []
    }
    gamesByRegion[game.region][game.round].push(game)
  })

  function getDisplayTeam(
    game: Game,
    slot: 1 | 2
  ): { name: string | null; seed: number | null } {
    if (game.round === 1 || (!game.source_game1 && !game.source_game2)) {
      if (slot === 1) {
        return { name: game.team1, seed: game.seed1 }
      } else {
        return { name: game.team2, seed: game.seed2 }
      }
    }

    const sourceId = slot === 1 ? game.source_game1 : game.source_game2
    if (!sourceId) return { name: null, seed: null }

    const sourceGame = gameById[sourceId]
    if (!sourceGame) return { name: null, seed: null }

    const picked = picksByGameId[sourceId]
    if (!picked) return { name: null, seed: null }

    let seed: number | null = null
    if (picked === sourceGame.team1) seed = sourceGame.seed1
    else if (picked === sourceGame.team2) seed = sourceGame.seed2

    return { name: picked, seed }
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {REGION_ORDER.map(region => {
        const regionRounds = gamesByRegion[region]
        if (!regionRounds) return null

        return (
          <div
            key={region}
            style={{
              marginBottom: 24,
              padding: 16,
              borderRadius: 12,
              background: 'rgba(15,23,42,0.9)',
              border: '1px solid #1f2937'
            }}
          >
            <h2
              style={{
                marginBottom: 12,
                fontSize: 18,
                fontWeight: 600,
                color: '#e5e7eb'
              }}
            >
              {region}
            </h2>

            {Object.keys(regionRounds)
              .map(r => parseInt(r, 10))
              .sort((a, b) => a - b)
              .map(round => {
                const roundGames = regionRounds[round]
                if (!roundGames || roundGames.length === 0) return null

                return (
                  <div key={round} style={{ marginBottom: 16 }}>
                    <h3
                      style={{
                        marginBottom: 8,
                        fontSize: 14,
                        fontWeight: 500,
                        color: '#9ca3af'
                      }}
                    >
                      {ROUND_LABELS[round] ?? `Round ${round}`}
                    </h3>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: 10
                      }}
                    >
                      {roundGames.map(game => {
                        const selected = picksByGameId[game.game_id] ?? null

                        const display1 = getDisplayTeam(game, 1)
                        const display2 = getDisplayTeam(game, 2)

                        const teamButtonStyle = (teamName: string | null) => ({
                          padding: '6px 8px',
                          borderRadius: 8,
                          border: '1px solid #334155',
                          background:
                            selected === teamName
                              ? 'rgba(37,99,235,0.9)'
                              : 'rgba(15,23,42,0.9)',
                          color: selected === teamName ? '#e5e7eb' : '#cbd5f5',
                          cursor: teamName ? 'pointer' : 'default',
                          fontSize: 13,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        })

                        return (
                          <div
                            key={game.game_id}
                            style={{
                              padding: 8,
                              borderRadius: 10,
                              background: 'rgba(15,23,42,0.7)',
                              border: '1px solid #111827'
                            }}
                          >
                            <div
                              style={{
                                fontSize: 11,
                                color: '#6b7280',
                                marginBottom: 4
                              }}
                            >
                              Game {game.game_number}
                            </div>

                            <button
                              type="button"
                              style={teamButtonStyle(display1.name)}
                              onClick={() =>
                                display1.name &&
                                onPickChange(game.game_id, display1.name)
                              }
                            >
                              <span>
                                {display1.seed != null && (
                                  <span style={{ marginRight: 6 }}>
                                    {display1.seed}
                                  </span>
                                )}
                                {display1.name ?? 'TBD'}
                              </span>
                              {selected === display1.name && (
                                <span style={{ fontSize: 11 }}>Selected</span>
                              )}
                            </button>

                            <button
                              type="button"
                              style={{
                                ...teamButtonStyle(display2.name),
                                marginTop: 6
                              }}
                              onClick={() =>
                                display2.name &&
                                onPickChange(game.game_id, display2.name)
                              }
                            >
                              <span>
                                {display2.seed != null && (
                                  <span style={{ marginRight: 6 }}>
                                    {display2.seed}
                                  </span>
                                )}
                                {display2.name ?? 'TBD'}
                              </span>
                              {selected === display2.name && (
                                <span style={{ fontSize: 11 }}>Selected</span>
                              )}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
          </div>
        )
      })}

      <div
        style={{
          marginTop: 24,
          padding: 16,
          borderRadius: 12,
          background: 'rgba(15,23,42,0.9)',
          border: '1px solid #1f2937'
        }}
      >
        <h2
          style={{
            marginBottom: 8,
            fontSize: 16,
            fontWeight: 600,
            color: '#e5e7eb'
          }}
        >
          Tiebreaker
        </h2>
        <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 8 }}>
          Final championship game total points (admin override).
        </p>
        <input
          type="number"
          value={tiebreaker ?? ''}
          onChange={e => onTiebreakerChange(e.target.value)}
          style={{
            padding: '8px 10px',
            borderRadius: 8,
            border: '1px solid #334155',
            background: '#020617',
            color: '#e5e7eb',
            width: 160
          }}
          placeholder="e.g. 142"
        />
      </div>
    </div>
  )
}
