'use client'

import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import ReadOnlyBracket from '../../../components/bracket/ReadOnlyBracket'
import BadgeGrid from '@/components/BadgeGrid'   // ⭐ NEW IMPORT

export default function AdminBracketsPage() {
  const [users, setUsers] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<number | null>(null)
  const [picks, setPicks] = useState<any[]>([])
  const [games, setGames] = useState<any[]>([])
  const [tiebreaker, setTiebreaker] = useState<number | null>(null)
  const [badges, setBadges] = useState<any>(null)   // ⭐ NEW STATE

  useEffect(() => {
    loadUsers()
    loadGames()
  }, [])

  useEffect(() => {
    if (selectedUser) {
      loadUserPicks()
      loadTiebreaker()
      loadBadges()   // ⭐ LOAD BADGES WHEN USER SELECTED
    }
  }, [selectedUser])

const loadUsers = async () => {
  const { data } = await supabase
    .from('picks')
    .select('user_id', { distinct: true })
    .order('user_id')

  setUsers(data ?? [])
}

  const loadGames = async () => {
    const { data } = await supabase
      .from('games')
      .select('*')
      .order('game_id')

    setGames(data ?? [])
  }

  const loadUserPicks = async () => {
    const { data } = await supabase
      .from('picks')
      .select('*')
      .eq('user_id', selectedUser)

    setPicks(data ?? [])
  }

  const loadTiebreaker = async () => {
    const { data } = await supabase
      .from('bracket_submissions')
      .select('tiebreaker')
      .eq('user_id', selectedUser)
      .single()

    setTiebreaker(data?.tiebreaker ?? null)
  }

  // ⭐ LOAD BADGES FOR THIS USER'S BRACKET
  const loadBadges = async () => {
    const { data } = await supabase
      .from('bracket_badges')
      .select('badges')
      .eq('bracket_id', selectedUser)   // your bracket_id == user_id in admin viewer
      .single()

    setBadges(data?.badges ?? {})
  }

  const totalScore = useMemo(
    () => picks.reduce((sum, p) => sum + (p.points_awarded ?? 0), 0),
    [picks]
  )

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* LEFT PANEL — USER LIST */}
      <div
        style={{
          width: 250,
          borderRight: '1px solid #cbd5e1',
          padding: 20,
          overflowY: 'auto'
        }}
      >
        <h2 style={{ marginBottom: 16 }}>Users</h2>

        {users.length === 0 && <p>No submissions yet.</p>}

        {users.map(u => (
          <div
            key={u.user_id}
            onClick={() => setSelectedUser(u.user_id)}
            style={{
              padding: '10px 12px',
              marginBottom: 8,
              borderRadius: 6,
              cursor: 'pointer',
              background:
                selectedUser === u.user_id ? '#1e293b' : '#f1f5f9',
              color:
                selectedUser === u.user_id ? 'white' : '#0f172a',
              border:
                selectedUser === u.user_id
                  ? '1px solid #334155'
                  : '1px solid #cbd5e1'
            }}
          >
            User {u.user_id}
          </div>
        ))}
      </div>

      {/* RIGHT PANEL — BRACKET VIEWER */}
      <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
        <h2>Bracket Viewer</h2>

        {!selectedUser && (
          <p style={{ marginTop: 20 }}>
            Select a user from the left to view their bracket.
          </p>
        )}

        {selectedUser && (
          <>
            {/* HEADER */}
            <div
              style={{
                marginTop: 10,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <h3>
                <div
                  style={{
                    marginTop: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                  }}
                >
                  <h3>Viewing Bracket for User {selectedUser}</h3>

                  <div
                    style={{
                      padding: '6px 12px',
                      borderRadius: 999,
                      background: '#0f172a',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: 14
                    }}
                  >
                    Total Score: {totalScore}
                  </div>

                  {tiebreaker !== null && (
                    <div
                      style={{
                        padding: '6px 12px',
                        borderRadius: 999,
                        background: '#1e293b',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: 14
                      }}
                    >
                      Tiebreaker: {tiebreaker}
                    </div>
                  )}
                </div>
              </h3>
            </div>

            {/* ⭐ BADGE GRID INSERTED HERE ⭐ */}
            <div style={{ marginTop: 20 }}>
              <BadgeGrid badges={badges} />
            </div>

            {/* BRACKET */}
            <div style={{ marginTop: 20 }}>
              <ReadOnlyBracket games={games} picks={picks} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
