'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
import { supabase } from "lib/supabaseClient";
import { getTeamLogo } from 'lib/getTeamLogo'
import HistoryOverlay from '@/app/_legacy/leaderboard/HistoryOverlay'
import TeamHoverCard from '@/components/TeamHoverCard'
import BadgeStrip from '@/components/BadgeStrip'
import ForumPanel from './ForumPanel'
import PrizePoolCard from './PrizePoolCard'

/* -----------------------------
   TABLE CELL STYLES (Dark Mode)
------------------------------ */
const th = {
  padding: '10px 8px',
  textAlign: 'center' as const,
  fontWeight: 600,
  borderBottom: '2px solid #334155',
  color: '#e5e7eb',
  fontSize: 14
}

const td = {
  padding: '8px 8px',
  borderBottom: '1px solid #475569',
  color: '#e5e7eb',
  textAlign: 'center' as const,
  fontSize: 14
}

/* -----------------------------
   RANK ARROW + NEW BADGE
------------------------------ */
const renderRankArrow = (change: number | null, previousRank: number | null) => {
  if (previousRank === null || previousRank === undefined) {
    return (
      <span
        style={{
          marginLeft: 8,
          background: '#3b82f6',
          color: 'white',
          padding: '2px 6px',
          borderRadius: 6,
          fontSize: 11,
          fontWeight: 700
        }}
      >
        NEW
      </span>
    )
  }

  if (change === null || change === 0) {
    return (
      <span style={{ color: '#94a3b8', marginLeft: 6, fontSize: 16 }}>
        •
      </span>
    )
  }

  if (change > 0) {
    return (
      <span
        style={{
          color: '#16A34A',
          marginLeft: 6,
          fontSize: 18,
          display: 'inline-flex',
          alignItems: 'center',
          animation: 'rankUpPulse 0.6s ease-out'
        }}
      >
        ▲ {change}
      </span>
    )
  }

  if (change < 0) {
    return (
      <span
        style={{
          color: '#DC2626',
          marginLeft: 6,
          fontSize: 18,
          display: 'inline-flex',
          alignItems: 'center',
          animation: 'rankDownPulse 0.6s ease-out'
        }}
      >
        ▼ {Math.abs(change)}
      </span>
    )
  }

  return null
}

/* -----------------------------
   ROW STYLE BASED ON RANK CHANGE
------------------------------ */
const getRowStyleByChange = (index: number, change: number | null) => {
  const baseBackground =
    index % 2 === 0 ? 'rgba(51,65,85,0.4)' : 'rgba(30,41,59,0.4)'

  if (!change || change === 0) {
    return {
      background: baseBackground,
      animation: 'fadeSlideIn 0.5s ease forwards'
    }
  }

  if (change > 0) {
    return {
      background: baseBackground,
      animation: 'fadeSlideIn 0.5s ease forwards, rankRowUpGlow 0.9s ease-out',
      position: 'relative' as const
    }
  }

  if (change < 0) {
    return {
      background: baseBackground,
      animation:
        'fadeSlideIn 0.5s ease forwards, rankRowDownGlow 0.9s ease-out',
      position: 'relative' as const
    }
  }

  return {
    background: baseBackground,
    animation: 'fadeSlideIn 0.5s ease forwards'
  }
}

export default function LeaderboardPage() {
  const [rows, setRows] = useState<any[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [selectedRound, setSelectedRound] = useState<number | null>(null)
  const [historyRows, setHistoryRows] = useState<any[]>([])
  const [hoveredTeam, setHoveredTeam] = useState<string | null>(null)

  // ⭐ Correct placement of prizePool hook
  const [prizePool, setPrizePool] = useState<any>(null)

  /* -----------------------------
     FETCH LEADERBOARD (FULL VIEW)
  ------------------------------ */
  const fetchLeaderboard = async () => {
    if (!supabase) return;\n    const { data, error } = await supabase
      .from('bracket_leaderboard_full_view')
      .select('*')
      .order('current_rank', { ascending: true })

    if (error) {
      console.error('Leaderboard error:', error)
      return
    }

    setRows(data ?? [])
  }

  /* -----------------------------
     FETCH PRIZE POOL
  ------------------------------ */
  const fetchPrizePool = async () => {
    if (!supabase) return;\n    const { data, error } = await supabase
      .from('contest_prize_pool')
      .select('*')
      .eq('sport', 'march_madness')
      .single()

    if (error) {
      console.error('Prize pool error:', error)
      return
    }

    setPrizePool(data)
  }

  useEffect(() => {
    fetchLeaderboard()
    fetchPrizePool()
  }, [])

  /* -----------------------------
     FETCH HISTORY SNAPSHOT
  ------------------------------ */
  const fetchHistory = async (round: number) => {
    if (!supabase) return;\n    const { data, error } = await supabase
      .from('leaderboard_snapshots')
      .select('*')
      .eq('round_number', round)
      .order('total_points', { ascending: false })

    if (error) {
      console.error('History fetch error:', error)
      return
    }

    setHistoryRows(data ?? [])
  }

  const handleRoundSelect = (round: number) => {
    setSelectedRound(round)
    setShowHistory(true)
    fetchHistory(round)
  }

  return (
    <div
      style={{
        padding: '30px',
        background: '#0f172a',
        minHeight: '100vh',
        color: '#e5e7eb'
      }}
    >
      {/* ⭐ TWO-COLUMN LAYOUT */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.2fr',
          gap: '30px'
        }}
      >
        {/* LEFT: FORUM */}
        <ForumPanel />

        {/* RIGHT: LEADERBOARD */}
        <div>
          {/* ⭐ PRIZE POOL CARD ABOVE HEADER */}
          {prizePool && (
            <div style={{ marginBottom: 20 }}>
              <PrizePoolCard pool={prizePool} />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h1
              style={{
                marginBottom: '20px',
                color: '#e5e7eb',
                fontSize: 28,
                fontWeight: 700
              }}
            >
              Leaderboard
            </h1>

            {/* HISTORY DROPDOWN */}
            <div>
              <button
                onClick={() => setShowHistory(prev => !prev)}
                style={{
                  padding: '8px 14px',
                  background: '#1E3A8A',
                  color: 'white',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 14
                }}
              >
                History ▾
              </button>

              {showHistory && (
                <div
                  style={{
                    position: 'absolute',
                    right: 30,
                    marginTop: 6,
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: 8,
                    padding: 10,
                    zIndex: 20
                  }}
                >
                  {[
                    { round: 1, label: 'Round of 64' },
                    { round: 2, label: 'Round of 32' },
                    { round: 3, label: 'Sweet 16' },
                    { round: 4, label: 'Elite 8' },
                    { round: 5, label: 'Final Four' },
                    { round: 6, label: 'Championship' }
                  ].map(r => (
                    <div
                      key={r.round}
                      onClick={() => handleRoundSelect(r.round)}
                      style={{
                        padding: '6px 10px',
                        cursor: 'pointer',
                        borderRadius: 6
                      }}
                    >
                      {r.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* MAIN TABLE */}
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                background: 'rgba(30,41,59,0.6)',
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 12px 30px rgba(0,0,0,0.45)'
              }}
            >
              <thead>
                <tr style={{ background: '#1E3A8A', color: 'white' }}>
                  <th style={{ ...th, width: 60 }}>Rank</th>
                  <th style={{ ...th, textAlign: 'left' }}>Name</th>
                  <th style={{ ...th, width: 120 }}>Points</th>
                  <th style={{ ...th, width: 120 }}>Champion</th>
                  <th style={{ ...th, width: 140 }}>Trend</th>
                  <th style={{ ...th, width: 180 }}>Potential</th>
                  <th style={{ ...th, width: 140 }}>Mulligans Used</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row, index) => {
                  const champion = row.champion_pick
                  const championLogo = champion ? getTeamLogo(champion) : null

                  const status = {
                    is_alive: row.is_alive,
                    is_eliminated: row.is_eliminated,
                    is_champion: row.is_champion,
                    is_playing: row.is_playing
                  }

                  const potential = {
                    earned_points: row.earned_points,
                    possible_points: row.possible_points,
                    max_possible_score: row.max_possible_score
                  }

                  const earned = potential.earned_points ?? 0
                  const possible = potential.possible_points ?? 0
                  const maxScore = potential.max_possible_score ?? earned

                  const percentRemaining =
                    maxScore > 0 ? (possible / maxScore) * 100 : 0

                  let barColor = '#64748b'
                  if (possible === 0) barColor = '#475569'
                  else if (percentRemaining > 70) barColor = '#22c55e'
                  else if (percentRemaining > 30) barColor = '#facc15'
                  else barColor = '#dc2626'

                  const championStyle: React.CSSProperties = {
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    transition: 'all 0.25s ease',
                    border: '2px solid transparent'
                  }

                  if (status.is_champion) {
                    championStyle.border = '3px solid gold'
                    championStyle.boxShadow = '0 0 12px gold'
                    championStyle.animation =
                      'championPulse 1.6s ease-in-out infinite'
                  } else if (status.is_playing) {
                    championStyle.border = '3px solid #facc15'
                    championStyle.boxShadow = '0 0 10px #facc15'
                    championStyle.animation =
                      'playingPulse 1.2s ease-in-out infinite'
                  } else if (status.is_alive) {
                    championStyle.border = '2px solid #22c55e'
                    championStyle.boxShadow = '0 0 8px rgba(34,197,94,0.5)'
                  } else if (status.is_eliminated) {
                    championStyle.border = '2px solid #dc2626'
                    championStyle.filter = 'grayscale(100%)'
                    championStyle.opacity = 0.6
                  }

                  return (
                    <tr
                      key={row.bracket_id}
                      style={getRowStyleByChange(index, row.rank_change)}
                    >
                      <td style={td}>
                        {row.current_rank}
                        {renderRankArrow(row.rank_change, row.previous_rank)}
                      </td>

                      <td style={{ ...td, textAlign: 'left' }}>
                        {row.user_name} #{row.bracket_number}
                        <BadgeStrip badges={row.badges} />
                      </td>

                      <td style={td}>{row.total_points}</td>

                      {/* CHAMPION COLUMN */}
                      <td style={td}>
                        {championLogo ? (
                          <div
                            style={{
                              position: 'relative',
                              display: 'inline-block'
                            }}
                            onMouseEnter={() => setHoveredTeam(champion)}
                            onMouseLeave={() => setHoveredTeam(null)}
                          >
                            <div style={championStyle}>
                              <img
                                src={championLogo}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                              />
                            </div>

                            {hoveredTeam === champion && (
                              <TeamHoverCard team={champion} />
                            )}

                            {status.is_champion && (
                              <div className="confetti-container"></div>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: '#64748b' }}>—</span>
                        )}
                      </td>

                      {/* TREND SHELL */}
                      <td style={td}>
                        <div
                          style={{
                            width: 70,
                            height: 22,
                            borderRadius: 999,
                            background:
                              'linear-gradient(90deg, rgba(148,163,184,0.15), rgba(56,189,248,0.5))',
                            overflow: 'hidden',
                            position: 'relative'
                          }}
                        ></div>
                      </td>

                      {/* POTENTIAL POINTS */}
                      <td style={{ ...td, textAlign: 'left' }}>
                        <div style={{ marginBottom: 4, fontSize: 13 }}>
                          Max:{' '}
                          <span style={{ fontWeight: 600 }}>{maxScore}</span>
                        </div>

                        <div
                          style={{
                            width: '100%',
                            height: 10,
                            background: '#1e293b',
                            borderRadius: 999,
                            overflow: 'hidden',
                            position: 'relative'
                          }}
                        >
                          <div
                            style={{
                              width: `${percentRemaining}%`,
                              height: '100%',
                              background: barColor,
                              transition: 'width 0.4s ease'
                            }}
                          ></div>
                        </div>

                        <div
                          style={{
                            marginTop: 4,
                            fontSize: 12,
                            color: '#94a3b8'
                          }}
                        >
                          Remaining: {possible}
                        </div>
                      </td>

                      {/* MULLIGANS */}
                      <td style={td}>{row.mulligans_used ?? 0}/2</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Animations */}
          <style>{`
            @keyframes fadeSlideIn {
              from { opacity: 0; transform: translateY(6px); }
              to { opacity: 1; transform: translateY(0); }
            }

            @keyframes rankUpPulse {
              0% { transform: translateY(0); }
              40% { transform: translateY(-2px); }
              100% { transform: translateY(0); }
            }

            @keyframes rankDownPulse {
              0% { transform: translateY(0); }
              40% { transform: translateY(2px); }
              100% { transform: translateY(0); }
            }

            @keyframes rankRowUpGlow {
              0% { box-shadow: 0 0 0 rgba(34,197,94,0); }
              40% { box-shadow: 0 0 18px rgba(34,197,94,0.55); }
              100% { box-shadow: 0 0 0 rgba(34,197,94,0); }
            }

            @keyframes rankRowDownGlow {
              0% { box-shadow: 0 0 0 rgba(248,113,113,0); }
              40% { box-shadow: 0 0 18px rgba(248,113,113,0.55); }
              100% { box-shadow: 0 0 0 rgba(248,113,113,0); }
            }

            @keyframes championPulse {
              0% { box-shadow: 0 0 10px gold; }
              50% { box-shadow: 0 0 20px gold; }
              100% { box-shadow: 0 0 10px gold; }
            }

            @keyframes playingPulse {
              0% { box-shadow: 0 0 6px #facc15; }
              50% { box-shadow: 0 0 14px #facc15; }
              100% { box-shadow: 0 0 6px #facc15; }
            }

            .confetti-container {
              position: absolute;
              top: -10px;
              left: 50%;
              width: 0;
              height: 0;
              pointer-events: none;
              animation: confettiBurst 1.2s ease-out forwards;
            }

            @keyframes confettiBurst {
              0% { opacity: 1; transform: translateX(-50%) translateY(0); }
            @keyframes confettiBurst {
              0% { opacity: 1; transform: translateX(-50%) translateY(0); }
              100% { opacity: 0; transform: translateX(-50%) translateY(-40px); }
            }
          `}</style>

        </div>
      </div>
    </div>
  )
}
