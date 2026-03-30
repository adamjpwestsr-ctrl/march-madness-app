'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { getSession } from '../lib/session';

export default async function AdminPage() {
  const session = await getSession();

  return (
    <div>
      <h1>Admin Panel</h1>
      <p>Logged in as {session?.email}</p>
    </div>
  );
}

type BracketStatusRow = {
  user_id: number
  name: string
  picks: number
  tiebreaker: number | null
  submitted: boolean
  updated_at: string | null
}

type LeaderboardRow = {
  user_id: number
  name: string
  score: number
  correct_picks: number
  champion_pick: string | null
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)

  const [totalUsers, setTotalUsers] = useState(0)
  const [submittedBrackets, setSubmittedBrackets] = useState(0)
  const [pendingMulligans, setPendingMulligans] = useState(0)
  const [gamesCompleted, setGamesCompleted] = useState(0)

  const [bracketStatus, setBracketStatus] = useState<BracketStatusRow[]>([])
  const [leaderboardPreview, setLeaderboardPreview] = useState<LeaderboardRow[]>([])

  // UX states
  const [simulating, setSimulating] = useState(false)
  const [showSimConfirm, setShowSimConfirm] = useState(false)
  const [nextRound, setNextRound] = useState<number | null>(null)

  const [resetting, setResetting] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [resetInput, setResetInput] = useState('')

  const [toast, setToast] = useState<string | null>(null)
  const [flashLeaderboard, setFlashLeaderboard] = useState(false)

  useEffect(() => {
    loadMetrics()
  }, [])

  async function loadMetrics() {
    setLoading(true)

    // USERS
    const { data: users } = await supabase.from('users').select('*')
    setTotalUsers(users?.length ?? 0)

    // PICKS + BRACKET SUBMISSIONS
    const { data: picks } = await supabase.from('picks').select('*')
    const { data: submissions } = await supabase.from('bracket_submissions').select('*')

    const submittedPicks = new Set(picks?.map(p => p.user_id))
    const submittedTB = new Set(submissions?.map(t => t.user_id))

    const fullySubmitted = [...submittedPicks].filter(uid => submittedTB.has(uid))
    setSubmittedBrackets(fullySubmitted.length)

    // MULLIGANS
    const { data: mulligans } = await supabase.from('mulligans').select('*')
    setPendingMulligans(mulligans?.filter(m => m.status === 'pending').length ?? 0)

    // GAMES
    const { data: games } = await supabase.from('games').select('*')
    setGamesCompleted(games?.filter(g => g.winner != null).length ?? 0)

    // BRACKET STATUS TABLE
    const rows: BracketStatusRow[] =
      users?.map(u => {
        const userPicks = picks?.filter(p => p.user_id === u.user_id) ?? []
        const tb = submissions?.find(t => t.user_id === u.user_id)

        return {
          user_id: u.user_id,
          name: u.name,
          picks: userPicks.length,
          tiebreaker: tb?.tiebreaker ?? null,
          submitted: submittedPicks.has(u.user_id) && submittedTB.has(u.user_id),
          updated_at: u.updated_at ?? null
        }
      }) ?? []

    setBracketStatus(rows)

    // LEADERBOARD SNAPSHOT
    const { data: leaderboard } = await supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .limit(10)

    setLeaderboardPreview((leaderboard ?? []) as LeaderboardRow[])

    setLoading(false)
  }

  // --- ADMIN ACTIONS ---
  async function recalcLeaderboard() {
    await supabase.rpc('run_game_scoring')
    showToast('Leaderboard recalculated!')
    loadMetrics()
  }

  async function lockBrackets() {
    await supabase.from('settings').update({ brackets_locked: true }).eq('id', 1)
    showToast('Brackets locked!')
    loadMetrics()
  }

  async function unlockBrackets() {
    await supabase.from('settings').update({ brackets_locked: false }).eq('id', 1)
    showToast('Brackets unlocked!')
    loadMetrics()
  }

  // Wrapper for UX
  async function handleSimulateRoundClick() {
    const { data: games } = await supabase
      .from('games')
      .select('*')
      .order('round, game_id')

    if (!games) return

    const incomplete = games.filter(g => g.winner == null)
    if (incomplete.length === 0) {
      showToast('All rounds are already complete!')
      return
    }

    const nr = Math.min(...incomplete.map(g => g.round))
    setNextRound(nr)
    setShowSimConfirm(true)
  }

  async function simulateRound() {
    const { data: games } = await supabase
      .from('games')
      .select('*')
      .order('round, game_id')

    if (!games) return

    const incomplete = games.filter(g => g.winner == null)
    if (incomplete.length === 0) return

    const nr = Math.min(...incomplete.map(g => g.round))
    const gamesThisRound = games.filter(g => g.round === nr)

    for (const game of gamesThisRound) {
      if (!game.team1 || !game.team2) continue

      let winner: string | null = null

      if (game.seed1 < game.seed2) winner = game.team1
      else if (game.seed2 < game.seed1) winner = game.team2
      else winner = Math.random() < 0.5 ? game.team1 : game.team2

      await supabase.from('games').update({ winner }).eq('game_id', game.game_id)
    }

    await supabase.rpc('run_game_scoring')

    // UX
    setFlashLeaderboard(true)
    setTimeout(() => setFlashLeaderboard(false), 800)

    showToast(`Simulated Round ${nr}!`)
    loadMetrics()
  }

  async function resetTournament() {
    await supabase.from('games').update({ winner: null }).neq('winner', null)
    await supabase.from('picks').delete().neq('user_id', null)
    await supabase.from('bracket_submissions').delete().neq('user_id', null)
    await supabase.from('mulligans').delete().neq('user_id', null)
    await supabase.from('leaderboard').delete().neq('user_id', null)

    await supabase.from('settings').update({ brackets_locked: false }).eq('id', 1)

    showToast('Tournament has been fully reset.')
    loadMetrics()
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const buttonStyle: React.CSSProperties = {
    padding: '10px 16px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    color: 'white'
  }

  return (
    <div style={{ padding: 24, color: '#e5e7eb' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>
        Admin Dashboard
      </h1>

      {/* METRICS */}
      {loading ? (
        <p style={{ color: '#94a3b8', marginBottom: 24 }}>Loading metrics…</p>
      ) : (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16,
            marginBottom: 32
          }}
        >
          <div style={metricCardStyle}>
            <h3>Total Users</h3>
            <div style={{ fontSize: 24 }}>{totalUsers}</div>
          </div>

          <div style={metricCardStyle}>
            <h3>Submitted Brackets</h3>
            <div style={{ fontSize: 24 }}>{submittedBrackets}</div>
          </div>

          <div style={metricCardStyle}>
            <h3>Pending Mulligans</h3>
            <div style={{ fontSize: 24 }}>{pendingMulligans}</div>
          </div>

          <div style={metricCardStyle}>
            <h3>Games Completed</h3>
            <div style={{ fontSize: 24 }}>{gamesCompleted}</div>
          </div>
        </div>
      )}

      {/* LEADERBOARD + ADMIN ACTIONS ROW */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 20,
          marginBottom: 32
        }}
      >
        {/* LEFT SIDE — LEADERBOARD SNAPSHOT */}
        <div>
          <h2 style={{ fontSize: 20, marginBottom: 12 }}>Leaderboard Snapshot</h2>

          <div
            style={{
              maxHeight: 300,
              overflowY: 'auto',
              borderRadius: 12,
              border: '1px solid #1f2937',
              boxShadow: flashLeaderboard ? '0 0 12px #7c3aed' : 'none',
              transition: 'box-shadow 0.4s ease'
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#111827' }}>
                <tr>
                  <th style={{ padding: 10 }}>Rank</th>
                  <th style={{ padding: 10, textAlign: 'left' }}>User</th>
                  <th style={{ padding: 10 }}>Score</th>
                  <th style={{ padding: 10 }}>Correct</th>
                  <th style={{ padding: 10 }}>Champion</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardPreview.map((row, i) => (
                  <tr
                    key={row.user_id}
                    style={{
                      background: 'rgba(15,23,42,0.7)',
                      borderBottom: '1px solid #1f2937'
                    }}
                  >
                    <td style={{ padding: 10 }}>{i + 1}</td>
                    <td style={{ padding: 10 }}>{row.name}</td>
                    <td style={{ padding: 10 }}>{row.score}</td>
                    <td style={{ padding: 10 }}>{row.correct_picks}</td>
                    <td style={{ padding: 10 }}>{row.champion_pick}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT SIDE — ADMIN ACTIONS */}
        <div>
          <h2 style={{ fontSize: 20, marginBottom: 12 }}>Admin Actions</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button
              style={{ ...buttonStyle, background: '#2563eb' }}
              onClick={recalcLeaderboard}
            >
              Recalculate Leaderboard
            </button>

            <button
              style={{ ...buttonStyle, background: '#dc2626' }}
              onClick={lockBrackets}
            >
              Lock Brackets
            </button>

            <button
              style={{ ...buttonStyle, background: '#059669' }}
              onClick={unlockBrackets}
            >
              Unlock Brackets
            </button>

            <button
              style={{
                ...buttonStyle,
                background: '#7c3aed',
                opacity: simulating ? 0.6 : 1
              }}
              disabled={simulating}
              onClick={handleSimulateRoundClick}
            >
              {simulating ? 'Simulating…' : 'Simulate Round'}
            </button>

            <button
              style={{
                ...buttonStyle,
                background: '#b91c1c',
                opacity: resetting ? 0.6 : 1
              }}
              disabled={resetting}
              onClick={() => setShowResetConfirm(true)}
            >
              {resetting ? 'Resetting…' : 'Reset Tournament'}
            </button>
          </div>
        </div>
      </div>

      {/* BRACKET STATUS TABLE */}
      <h2 style={{ fontSize: 20, marginBottom: 12 }}>Bracket Status</h2>

      <div
        style={{
          overflowX: 'auto',
          marginBottom: 32,
          borderRadius: 12,
          border: '1px solid #1f2937'
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#111827' }}>
            <tr>
              <th style={{ padding: 10, textAlign: 'left' }}>User</th>
              <th style={{ padding: 10 }}>Submitted</th>
              <th style={{ padding: 10 }}>Picks</th>
              <th style={{ padding: 10 }}>Tiebreaker</th>
              <th style={{ padding: 10 }}>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {bracketStatus.map(row => (
              <tr
                key={row.user_id}
                style={{
                  background: 'rgba(15,23,42,0.7)',
                  borderBottom: '1px solid #1f2937',
                  cursor: 'pointer'
                }}
                onClick={() =>
                  (window.location.href = `/admin/edit-bracket?user_id=${row.user_id}`)
                }
              >
                <td style={{ padding: 10 }}>{row.name}</td>
                <td style={{ padding: 10 }}>{row.submitted ? '✔' : '—'}</td>
                <td style={{ padding: 10 }}>{row.picks}</td>
                <td style={{ padding: 10 }}>{row.tiebreaker ?? '—'}</td>
                <td style={{ padding: 10 }}>
                  {row.updated_at?.slice(0, 10) ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADMIN LINKS */}
      <p style={{ marginBottom: 20, color: '#94a3b8' }}>
        Choose an admin tool:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <a
          href="/admin/set-winners"
          style={{
            padding: 12,
            background: '#1e293b',
            borderRadius: 8,
            border: '1px solid #334155',
            color: 'white',
            textDecoration: 'none'
          }}
        >
          Set Game Winners
        </a>

        <a
          href="/admin/edit-bracket"
          style={{
            padding: 12,
            background: '#1e293b',
            borderRadius: 8,
            border: '1px solid #334155',
            color: 'white',
            textDecoration: 'none'
          }}
        >
          Edit User Brackets
        </a>

        <a
          href="/admin/mulligans"
          style={{
            padding: 12,
            background: '#1e293b',
            borderRadius: 8,
            border: '1px solid #334155',
            color: 'white',
            textDecoration: 'none'
          }}
        >
          Mulligan Manager
        </a>

        <a
          href="/admin/leaderboard"
          style={{
            padding: 12,
            background: '#1e293b',
            borderRadius: 8,
            border: '1px solid #334155',
            color: 'white',
            textDecoration: 'none'
          }}
        >
          Leaderboard Admin
        </a>
      </div>
      {/* SIMULATE ROUND CONFIRMATION MODAL */}
      {showSimConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <div
            style={{
              background: '#1e293b',
              padding: 24,
              borderRadius: 12,
              width: 320,
              border: '1px solid #334155'
            }}
          >
            <h3 style={{ marginBottom: 12, fontSize: 18 }}>
              Simulate Round {nextRound}
            </h3>
            <p style={{ marginBottom: 20, color: '#94a3b8' }}>
              This will automatically pick winners for all remaining games in
              Round {nextRound}.
            </p>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                style={{ ...buttonStyle, background: '#7c3aed', flex: 1 }}
                onClick={async () => {
                  setShowSimConfirm(false)
                  setSimulating(true)
                  await simulateRound()
                  setSimulating(false)
                }}
              >
                Confirm
              </button>

              <button
                style={{ ...buttonStyle, background: '#475569', flex: 1 }}
                onClick={() => setShowSimConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESET TOURNAMENT CONFIRMATION MODAL */}
      {showResetConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <div
            style={{
              background: '#1e293b',
              padding: 24,
              borderRadius: 12,
              width: 360,
              border: '1px solid #334155'
            }}
          >
            <h3 style={{ marginBottom: 12, fontSize: 18, color: '#f87171' }}>
              Reset Tournament
            </h3>

            <p style={{ marginBottom: 16, color: '#94a3b8' }}>
              This will permanently delete:
            </p>

            <ul style={{ marginBottom: 16, color: '#e5e7eb', paddingLeft: 20 }}>
              <li>All game winners</li>
              <li>All picks</li>
              <li>All tiebreakers</li>
              <li>All mulligans</li>
              <li>All leaderboard scores</li>
            </ul>

            <p style={{ marginBottom: 16, color: '#fca5a5' }}>
              This action cannot be undone.
            </p>

            <p style={{ marginBottom: 12, color: '#94a3b8' }}>
              Type <strong>RESET</strong> to confirm:
            </p>

            <input
              value={resetInput}
              onChange={e => setResetInput(e.target.value)}
              placeholder="RESET"
              style={{
                width: '100%',
                padding: 10,
                borderRadius: 6,
                border: '1px solid #334155',
                background: '#0f172a',
                color: 'white',
                marginBottom: 20
              }}
            />

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                style={{
                  ...buttonStyle,
                  background: resetInput === 'RESET' ? '#b91c1c' : '#475569',
                  flex: 1,
                  cursor: resetInput === 'RESET' ? 'pointer' : 'not-allowed'
                }}
                disabled={resetInput !== 'RESET' || resetting}
                onClick={async () => {
                  setResetting(true)
                  await resetTournament()
                  setResetting(false)
                  setShowResetConfirm(false)
                  setResetInput('')
                }}
              >
                {resetting ? 'Resetting…' : 'Confirm'}
              </button>

              <button
                style={{ ...buttonStyle, background: '#475569', flex: 1 }}
                onClick={() => {
                  setShowResetConfirm(false)
                  setResetInput('')
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            background: '#1e293b',
            padding: '12px 18px',
            borderRadius: 8,
            border: '1px solid #334155',
            color: 'white',
            zIndex: 9999
          }}
        >
          {toast}
        </div>
      )}
    </div>
  )
}

// --- STYLES ---
const metricCardStyle: React.CSSProperties = {
  padding: 16,
  borderRadius: 12,
  background: 'rgba(15,23,42,0.9)',
  border: '1px solid #1f2937',
  color: '#e5e7eb',
  minWidth: 180
}
