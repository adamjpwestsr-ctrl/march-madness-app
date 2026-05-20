'use client'

import React from 'react'
import { Game, Pick } from '../../types/types'

interface ReadOnlyBracketProps {
  games: Game[]
  picks: Pick[]
}

export default function ReadOnlyBracket({ games, picks }: ReadOnlyBracketProps) {
  if (!games || games.length === 0) {
    return <p>No games found.</p>
  }

  const regions = ['East', 'West', 'South', 'Midwest', 'Final Four', 'Championship']

  const gamesByRegion = (region: string) =>
    games.filter(g => g.region === region)

  const getPickForGame = (gameId: number) =>
    picks.find(p => p.game_id === gameId) || null

  const groupByRound = (regionGames: Game[]) => {
    const grouped: Record<number, Game[]> = {}
    regionGames.forEach(g => {
      if (!grouped[g.round]) grouped[g.round] = []
      grouped[g.round].push(g)
    })
    return grouped
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      {regions.map(region => {
        const regionGames = gamesByRegion(region)
        if (regionGames.length === 0) return null

        const rounds = groupByRound(regionGames)
        const roundNumbers = Object.keys(rounds)
          .map(n => parseInt(n))
          .sort((a, b) => a - b)

        return (
          <div key={region}>
            <h2
              style={{
                textAlign: 'center',
                marginBottom: 20,
                fontSize: 22,
                fontWeight: 700,
                textTransform: 'uppercase'
              }}
            >
              {region}
            </h2>

            <div
              style={{
                display: 'grid',
                gridAutoFlow: 'column',
                gridAutoColumns: '200px',
                columnGap: 20
              }}
            >
              {roundNumbers.map(round => (
                <div key={round} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {rounds[round].map(game => {
                    const pick = getPickForGame(game.game_id)
                    const userPick = pick?.selected_team || null
                    const isCompleted = !!game.winner
                    const isCorrect = isCompleted && userPick === game.winner
                    const isIncorrect = isCompleted && userPick && userPick !== game.winner
                    const points = pick?.points_awarded ?? 0

                    const gameBorderColor = isCorrect
                      ? '#16a34a'
                      : isIncorrect
                      ? '#dc2626'
                      : '#cbd5e1'

                    const gameBg = isCorrect
                      ? '#ecfdf3'
                      : isIncorrect
                      ? '#fef2f2'
                      : '#f8fafc'

                    const team1 = game.team1
                    const team2 = game.team2

                    return (
                      <div
                        key={game.game_id}
                        style={{
                          padding: 10,
                          borderRadius: 8,
                          border: `1px solid ${gameBorderColor}`,
                          background: gameBg
                        }}
                      >
                        {/* TEAM 1 */}
                        <div
                          style={{
                            fontWeight: userPick === team1?.team_id ? 700 : 400,
                            color: userPick === team1?.team_id ? '#1d4ed8' : '#0f172a'
                          }}
                        >
                          {team1?.name || 'TBD'} (Seed {team1?.seed ?? '?'})
                        </div>

                        {/* TEAM 2 */}
                        <div
                          style={{
                            fontWeight: userPick === team2?.team_id ? 700 : 400,
                            color: userPick === team2?.team_id ? '#1d4ed8' : '#0f172a'
                          }}
                        >
                          {team2?.name || 'TBD'} (Seed {team2?.seed ?? '?'})
                        </div>

                        {userPick && (
                          <div
                            style={{
                              marginTop: 6,
                              fontSize: 12,
                              color: '#475569'
                            }}
                          >
                            Picked: <strong>{userPick}</strong>
                            {isCompleted && (
                              <>
                                {' • '}
                                {isCorrect ? 'Correct' : 'Incorrect'}
                              </>
                            )}
                          </div>
                        )}

                        {isCompleted && (
                          <div
                            style={{
                              marginTop: 4,
                              fontSize: 12,
                              color: isCorrect ? '#15803d' : '#64748b'
                            }}
                          >
                            Winner: <strong>{game.winner}</strong>
                            {isCorrect && (
                              <> • Points: <strong>{points}</strong></>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
