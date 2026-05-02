'use client'

import React from 'react'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { getTeamLogo } from 'lib/getTeamLogo'

const TEAM_BLOCK_HEIGHT = 52
const ROUND_COLUMN_WIDTH = 170

type Game = {
  game_id: number
  round: number
  region: string
  team1: string | null
  team2: string | null
  seed1: number | null
  seed2: number | null
  source_game1: number | null
  source_game2: number | null
}

type Picks = Record<number, string>

export default function BracketPage() {
  const [games, setGames] = useState<Game[]>([])
  const [picks, setPicks] = useState<Picks>({})
  const [hoverTeam, setHoverTeam] = useState<string | null>(null)
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(
    null
  )
  const [highlightFinalFourPath, setHighlightFinalFourPath] = useState(false)

  useEffect(() => {
    fetchGames()
  }, [])

  const fetchGames = async () => {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('game_id')

    if (error) {
      console.error('Error loading games:', error)
      setGames([])
      return
    }

    setGames((data as Game[]) ?? [])
  }

  const handlePick = (gameId: number, team: string | null) => {
    if (!team) return

    const updated: Picks = {
      ...picks,
      [gameId]: team
    }

    setPicks(updated)
    updateFutureRounds(updated)
  }

  const updateFutureRounds = (updatedPicks: Picks) => {
    const baseGames = [...games]

    const gameMap: Record<number, Game> = {}
    baseGames.forEach(g => (gameMap[g.game_id] = { ...g }))

    Object.entries(updatedPicks).forEach(([gameId, winner]) => {
      const id = parseInt(gameId)
      const game = gameMap[id]
      if (!game) return

      Object.values(gameMap).forEach(nextGame => {
        if (nextGame.source_game1 === id) nextGame.team1 = winner
        if (nextGame.source_game2 === id) nextGame.team2 = winner
      })
    })

    setGames(Object.values(gameMap))
  }

  const submitBracket = async () => {
    const userId = 1

    const picksArray = Object.entries(picks).map(([gameId, team]) => ({
      user_id: userId,
      game_id: parseInt(gameId),
      selected_team: team
    }))

    const { error } = await supabase.from('picks').insert(picksArray)
    if (error) {
      console.error('Error submitting bracket:', error)
      alert('Error submitting bracket')
      return
    }

    alert('Bracket submitted!')
  }

  const resetBracket = async () => {
    setPicks({})
    await fetchGames()
  }

  const isEnabled = (game: Game) => {
    if (game.round === 1) return true
    const s1 = game.source_game1 ? picks[game.source_game1] : null
    const s2 = game.source_game2 ? picks[game.source_game2] : null
    return !!s1 && !!s2
  }

  const handleHoverEnter = (
    team: string | null,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (!team) return
    setHoverTeam(team)
    setHoverPos({ x: e.clientX, y: e.clientY })
  }

  const handleHoverLeave = () => {
    setHoverTeam(null)
    setHoverPos(null)
  }

  const renderHoverCard = () => {
    if (!hoverTeam || !hoverPos) return null

    return (
      <div
        style={{
          position: 'fixed',
          top: hoverPos.y + 12,
          left: hoverPos.x + 12,
          background: 'white',
          border: '1px solid #cbd5e1',
          borderRadius: '10px',
          padding: '12px 16px',
          boxShadow: '0 6px 14px rgba(0,0,0,0.18)',
          zIndex: 1000,
          minWidth: '200px',
          fontFamily: 'Arial, sans-serif',
          color: '#1e293b',
          fontSize: '14px',
          lineHeight: '1.4'
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: '6px', fontSize: '15px' }}>
          {hoverTeam}
        </div>
        <div style={{ opacity: 0.7 }}>Details coming soon…</div>
      </div>
    )
  }

  const getRoundLabel = (region: string, round: number) => {
    if (region === 'Final Four') return 'Final Four'
    if (region === 'Championship') return 'Championship'

    switch (round) {
      case 1:
        return 'Round 1'
      case 2:
        return 'Round 2'
      case 3:
        return 'Sweet 16'
      case 4:
        return 'Elite 8'
      default:
        return `Round ${round}`
    }
  }

  const getFinalFourTeams = () => {
    const finalFourGames = games.filter(g => g.region === 'Final Four')
    const teams = new Set<string>()

    finalFourGames.forEach(g => {
      const winner = picks[g.game_id]
      if (winner) {
        teams.add(winner)
      } else {
        if (g.team1) teams.add(g.team1)
        if (g.team2) teams.add(g.team2)
      }
    })

    return teams
  }

  const renderGameButtons = (game: Game) => {
    const disabled = !isEnabled(game)
    const selected = picks[game.game_id]

    const finalFourTeams = highlightFinalFourPath ? getFinalFourTeams() : null
    const isInFinalFourPath =
      highlightFinalFourPath &&
      finalFourTeams &&
      ((game.team1 && finalFourTeams.has(game.team1)) ||
        (game.team2 && finalFourTeams.has(game.team2)))

    const baseStyle: React.CSSProperties = {
      height: TEAM_BLOCK_HEIGHT,
      width: '100%',
      borderRadius: 10,
      border: isInFinalFourPath ? '2px solid #16A34A' : '1px solid #1D4ED8',
      background:
        'linear-gradient(135deg, rgba(15,23,42,0.96), rgba(30,64,175,0.9))',
      color: '#e5e7eb',
      fontWeight: 600,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition:
        'transform 0.14s ease, box-shadow 0.14s ease, border-color 0.14s ease, background 0.14s ease',
      boxShadow: '0 3px 8px rgba(0,0,0,0.18)',
      outline: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 10px',
      textAlign: 'left',
      gap: 8
    }

    const selectedStyle: React.CSSProperties = {
      background: isInFinalFourPath
        ? 'linear-gradient(135deg, #16A34A, #15803D)'
        : 'linear-gradient(135deg, #1D4ED8, #1E40AF)',
      transform: 'translateY(-1px)',
      boxShadow: '0 6px 14px rgba(0,0,0,0.35)',
      borderColor: isInFinalFourPath ? '#16A34A' : '#1D4ED8'
    }

    const logo1 = getTeamLogo(game.team1)
    const logo2 = getTeamLogo(game.team2)

    return (
      <div
        style={{
          marginBottom: 10,
          position: 'relative',
          paddingLeft: 0
        }}
      >
        <button
          disabled={disabled}
          onClick={() => handlePick(game.game_id, game.team1)}
          onMouseEnter={e => handleHoverEnter(game.team1, e)}
          onMouseLeave={handleHoverLeave}
          style={{
            ...baseStyle,
            ...(selected === game.team1 ? selectedStyle : {})
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {logo1 && (
              <img
                src={logo1}
                style={{ width: 22, height: 22, borderRadius: 9999 }}
              />
            )}
            <span style={{ fontSize: 13, whiteSpace: 'nowrap' }}>
              {game.seed1 ? `${game.seed1} ` : ''}
              {game.team1}
            </span>
          </div>
        </button>

        <button
          disabled={disabled}
          onClick={() => handlePick(game.game_id, game.team2)}
          onMouseEnter={e => handleHoverEnter(game.team2, e)}
          onMouseLeave={handleHoverLeave}
          style={{
            ...baseStyle,
            ...(selected === game.team2 ? selectedStyle : {})
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {logo2 && (
              <img
                src={logo2}
                style={{ width: 22, height: 22, borderRadius: 9999 }}
              />
            )}
            <span style={{ fontSize: 13, whiteSpace: 'nowrap' }}>
              {game.seed2 ? `${game.seed2} ` : ''}
              {game.team2}
            </span>
          </div>
        </button>
      </div>
    )
  }

  const groupByRound = (games: Game[]) => {
    const rounds: Record<number, Game[]> = {}
    games.forEach(g => {
      if (!rounds[g.round]) rounds[g.round] = []
      rounds[g.round].push(g)
    })
    return rounds
  }

  const regionOrder = [
    'East',
    'South',
    'Final Four',
    'Championship',
    'West',
    'Midwest'
  ]

  const regionAreas: Record<string, string> = {
    East: 'east',
    South: 'south',
    West: 'west',
    Midwest: 'midwest',
    'Final Four': 'finalfour',
    Championship: 'champ'
  }

  return (
    <div
      style={{
        padding: 20,
        position: 'relative',
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        background: '#0f172a',
        minHeight: '100vh',
        color: '#e5e7eb'
      }}
    >
      <h1
        style={{
          marginBottom: 20,
          fontSize: 26,
          fontWeight: 700,
          textAlign: 'center',
          letterSpacing: 0.5
        }}
      >
        March Madness Bracket
      </h1>

      <div style={{ marginBottom: 16, textAlign: 'center' }}>
        <button
          onClick={() => setHighlightFinalFourPath(prev => !prev)}
          style={{
            padding: '8px 16px',
            fontSize: 14,
            background: highlightFinalFourPath ? '#16A34A' : '#1D4ED8',
            color: 'white',
            borderRadius: 999,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 3px 8px rgba(0,0,0,0.25)'
          }}
        >
          {highlightFinalFourPath
            ? 'Hide path to Final Four'
            : 'Show my path to Final Four'}
        </button>
      </div>

      {/* MAIN GRID */}
      <div
        style={{
          display: 'grid',
          gridTemplateAreas: `
            "east     finalfour   west"
            "south    champ       midwest"
          `,
          gridTemplateColumns: '1fr auto 1fr',
          gap: 32,
          overflowX: 'auto',
          paddingBottom: 40,
          maxWidth: 1800,
          margin: '0 auto'
        }}
      >
        {regionOrder.map(region => {
          const regionGames = games.filter(g => g.region === region)
          if (regionGames.length === 0) return null

          const rounds = groupByRound(regionGames)
          const roundKeys = Object.keys(rounds)
            .map(r => parseInt(r))
            .sort((a, b) => a - b)

          return (
            <div
              key={region}
              style={{
                gridArea: regionAreas[region],
                borderRadius: 12,
                padding: 16,
                background: 'rgba(15,23,42,0.96)',
                border: '1px solid rgba(148,163,184,0.45)',
                boxShadow: '0 12px 30px rgba(0,0,0,0.45)',
                minWidth: roundKeys.length * (ROUND_COLUMN_WIDTH + 16)
              }}
            >
              <h2
                style={{
                  marginBottom: 14,
                  textAlign: 'center',
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#e5e7eb'
                }}
              >
                {region}
              </h2>

              {/* Rounds laid out horizontally inside each region */}
              <div
                style={{
                  display: 'grid',
                  gridAutoFlow: 'column',
                  gridAutoColumns: `${ROUND_COLUMN_WIDTH}px`,
                  columnGap: 16,
                  alignItems: 'flex-start'
                }}
              >
                {roundKeys.map(round => (
                  <div
                    key={round}
                    style={{
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8
                    }}
                  >
                    {region !== 'Final Four' &&
                      region !== 'Championship' && (
                        <h4
                          style={{
                            marginBottom: 4,
                            fontSize: 12,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            color: '#9ca3af',
                            textAlign: 'center'
                          }}
                        >
                          {getRoundLabel(region, round)}
                        </h4>
                      )}

                    {rounds[round]?.map(game => (
                      <div key={game.game_id}>{renderGameButtons(game)}</div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div
        style={{
          marginTop: 20,
          display: 'flex',
          justifyContent: 'center',
          gap: 12
        }}
      >
        <button
          onClick={submitBracket}
          style={{
            padding: '12px 24px',
            fontSize: 16,
            background: '#1D4ED8',
            color: 'white',
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.25)'
          }}
        >
          Submit Bracket
        </button>

        <button
          onClick={resetBracket}
          style={{
            padding: '12px 24px',
            fontSize: 16,
            background: '#6B7280',
            color: 'white',
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.25)'
          }}
        >
          Reset Bracket
        </button>
      </div>

      {renderHoverCard()}
    </div>
  )
}
