'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
import { supabase } from 'lib/supabaseClient'
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

  const [prizePool, setPrizePool] = useState<any>(null)

  /* -----------------------------
     FETCH LEADERBOARD (FULL VIEW)
  ------------------------------ */
  const fetchLeaderboard = async () => {
    if (!supabase) return

    const { data, error } = await supabase
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
    if (!supabase) return

    const { data, error } = await supabase
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
    if (!supabase) return

    const { data, error } = await supabase
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

          {/* HEADER */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: 16
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  color: '#f9fafb'
                }}
              >
                Bracket Leaderboard
              </h1>
              <p style={{ color: '#9ca3af', marginTop: 4, fontSize: 14 }}>
                Live standings with rank movement, badges, and history snapshots.
              </p>
            </div>

            {/* BADGE STRIP */}
            <div style={{ minWidth: 260 }}>
              <BadgeStrip />
            </div>
          </div>

          {/* HISTORY OVERLAY TRIGGER */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: 12
            }}
          >
            <button
              onClick={() => setShowHistory(true)}
              style={{
                padding: '6px 12px',
                borderRadius: 999,
                border: '1px solid #4b5563',
                background: 'rgba(15,23,42,0.9)',
                color: '#e5e7eb',
                fontSize: 13,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer'
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '999px',
                  background: '#22c55e',
                  boxShadow: '0 0 8px rgba(34,197,94,0.8)'
                }}
              />
              View History Snapshots
            </button>
          </div>

          {/* TABLE WRAPPER */}
          <div
            style={{
              borderRadius: 16,
              border: '1px solid #1f2937',
              background:
                'radial-gradient(circle at top, rgba(56,189,248,0.08), transparent 55%), rgba(15,23,42,0.95)',
              boxShadow:
                '0 18px 45px rgba(15,23,42,0.9), 0 0 0 1px rgba(15,23,42,0.9)',
              overflow: 'hidden'
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont'
              }}
            >
              <thead
                style={{
                  background:
                    'linear-gradient(to right, rgba(15,23,42,0.95), rgba(15,23,42,0.9))'
                }}
              >
                <tr>
                  <th style={{ ...th, textAlign: 'left', paddingLeft: 16 }}>
                    Rank
                  </th>
                  <th style={{ ...th, textAlign: 'left' }}>Bracket</th>
                  <th style={th}>Owner</th>
                  <th style={th}>Correct</th>
                  <th style={th}>Remaining</th>
                  <th style={th}>Max Pts</th>
                  <th style={th}>Total Pts</th>
                  <th style={th}>Badges</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row, index) => {
                  const {
                    current_rank,
                    previous_rank,
                    rank_change,
                    bracket_name,
                    owner_name,
                    correct_picks,
                    remaining_teams,
                    max_points,
                    total_points,
                    favorite_team
                  } = row

                  const rowStyle = getRowStyleByChange(index, rank_change)

                  return (
                    <tr
                      key={row.bracket_id}
                      style={{
                        ...rowStyle,
                        transition:
                          'transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease'
                      }}
                      onMouseEnter={() => {
                        if (favorite_team) setHoveredTeam(favorite_team)
                      }}
                      onMouseLeave={() => setHoveredTeam(null)}
                    >
                      {/* RANK + MOVEMENT */}
                      <td
                        style={{
                          ...td,
                          textAlign: 'left',
                          paddingLeft: 16,
                          fontWeight: 600,
                          fontSize: 15,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 28,
                            height: 28,
                            borderRadius: 999,
                            background:
                              current_rank === 1
                                ? 'linear-gradient(135deg, #facc15, #f97316)'
                                : 'rgba(15,23,42,0.9)',
                            color:
                              current_rank === 1 ? '#111827' : '#e5e7eb',
                            boxShadow:
                              current_rank === 1
                                ? '0 0 18px rgba(250,204,21,0.7)'
                                : '0 0 0 1px rgba(31,41,55,0.9)'
                          }}
                        >
                          {current_rank}
                        </span>
                        {renderRankArrow(rank_change, previous_rank)}
                      </td>

                      {/* BRACKET NAME + FAVORITE TEAM LOGO */}
                      <td
                        style={{
                          ...td,
                          textAlign: 'left',
                          fontWeight: 500,
                          fontSize: 15
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10
                          }}
                        >
                          {favorite_team && (
                            <img
                              src={getTeamLogo(favorite_team)}
                              alt={favorite_team}
                              style={{
                                width: 26,
                                height: 26,
                                borderRadius: 999,
                                border: '1px solid rgba(148,163,184,0.6)',
                                background: '#020617'
                              }}
                            />
                          )}
                          <span>{bracket_name}</span>
                        </div>
                      </td>

                      {/* OWNER */}
                      <td style={td}>{owner_name}</td>

                      {/* CORRECT PICKS */}
                      <td style={td}>{correct_picks}</td>

                      {/* REMAINING TEAMS */}
                      <td style={td}>{remaining_teams}</td>

                      {/* MAX POINTS */}
                      <td style={td}>{max_points}</td>

                      {/* TOTAL POINTS */}
                      <td
                        style={{
                          ...td,
                          fontWeight: 600,
                          color: '#facc15'
                        }}
                      >
                        {total_points}
                      </td>

                      {/* BADGES */}
                      <td style={td}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: 6
                          }}
                        >
                          <span
                            style={{
                              padding: '2px 6px',
                              borderRadius: 999,
                              background: 'rgba(34,197,94,0.12)',
                              color: '#4ade80',
                              fontSize: 11,
                              fontWeight: 600
                            }}
                          >
                            HOT STREAK
                          </span>
                          <span
                            style={{
                              padding: '2px 6px',
                              borderRadius: 999,
                              background: 'rgba(59,130,246,0.12)',
                              color: '#60a5fa',
                              fontSize: 11,
                              fontWeight: 600
                            }}
                          >
                            FINAL FOUR
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* HISTORY OVERLAY */}
      {showHistory && (
        <HistoryOverlay
          onClose={() => setShowHistory(false)}
          selectedRound={selectedRound}
          onRoundSelect={handleRoundSelect}
          historyRows={historyRows}
        />
      )}

      {/* TEAM HOVER CARD */}
      {hoveredTeam && (
        <div
          style={{
            position: 'fixed',
            pointerEvents: 'none',
            zIndex: 50
          }}
        >
          <TeamHoverCard team={hoveredTeam} />
        </div>
      )}

      {/* GLOBAL STYLES FOR ANIMATIONS */}
      <style jsx global>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes rankUpPulse {
          0% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-2px);
          }
          100% {
            transform: translateY(0);
          }
        }

        @keyframes rankDownPulse {
          0% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(2px);
          }
          100% {
            transform: translateY(0);
          }
        }

        @keyframes rankRowUpGlow {
          0% {
            box-shadow: 0 0 0 rgba(34, 197, 94, 0);
          }
          40% {
            box-shadow: 0 0 18px rgba(34, 197, 94, 0.45);
          }
          100% {
            box-shadow: 0 0 0 rgba(34, 197, 94, 0);
          }
        }

        @keyframes rankRowDownGlow {
          0% {
            box-shadow: 0 0 0 rgba(248, 113, 113, 0);
          }
          40% {
            box-shadow: 0 0 18px rgba(248, 113, 113, 0.45);
          }
          100% {
            box-shadow: 0 0 0 rgba(248, 113, 113, 0);
          }
        }
      `}</style>
    </div>
  )
}
