'use client'

import React from 'react'
import { getTeamLogo } from 'lib/getTeamLogo'

type HistoryOverlayProps = {
  selectedRound: number | null
  onRoundSelect: (round: number) => void
  historyRows: any[]
  onClose: () => void
}

export default function HistoryOverlay({
  selectedRound,
  onRoundSelect,
  historyRows,
  onClose
}: HistoryOverlayProps) {
  const roundNames: Record<number, string> = {
    1: 'Round of 64',
    2: 'Round of 32',
    3: 'Sweet 16',
    4: 'Elite 8',
    5: 'Final Four',
    6: 'Championship'
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        animation: 'fadeIn 0.25s ease'
      }}
    >
      {/* MODAL */}
      <div
        style={{
          width: '90%',
          maxWidth: 700,
          background: '#1e293b',
          borderRadius: 12,
          padding: 20,
          boxShadow: '0 12px 30px rgba(0,0,0,0.45)',
          animation: 'slideUp 0.25s ease'
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 16
          }}
        >
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#e5e7eb' }}>
            {selectedRound ? roundNames[selectedRound] : 'History'} Rankings
          </h2>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#e5e7eb',
              fontSize: 22,
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        {/* ROUND SELECTOR */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            marginBottom: 16,
            flexWrap: 'wrap'
          }}
        >
          {Object.entries(roundNames).map(([num, label]) => {
            const roundNum = Number(num)
            const isActive = selectedRound === roundNum

            return (
              <button
                key={num}
                onClick={() => onRoundSelect(roundNum)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: isActive
                    ? '1px solid #38bdf8'
                    : '1px solid #475569',
                  background: isActive ? '#0ea5e9' : 'rgba(30,41,59,0.6)',
                  color: isActive ? '#0f172a' : '#e5e7eb',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600
                }}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* TABLE */}
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            background: 'rgba(30,41,59,0.6)',
            borderRadius: 12,
            overflow: 'hidden'
          }}
        >
          <thead>
            <tr style={{ background: '#1E3A8A', color: 'white' }}>
              <th style={th}>Rank</th>
              <th style={{ ...th, textAlign: 'left' }}>Name</th>
              <th style={th}>Points</th>
              <th style={th}>Mulligans</th>
            </tr>
          </thead>

          <tbody>
            {historyRows.map((row, index) => {
              const championLogo = row.champion_pick
                ? getTeamLogo(row.champion_pick)
                : null

              return (
                <tr
                  key={row.user_id}
                  style={{
                    background:
                      index % 2 === 0
                        ? 'rgba(51,65,85,0.4)'
                        : 'rgba(30,41,59,0.4)'
                  }}
                >
                  <td style={td}>{index + 1}</td>

                  <td style={{ ...td, textAlign: 'left' }}>
                    {row.name}
                    {championLogo && (
                      <img
                        src={championLogo ?? ''}
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          marginLeft: 8,
                          verticalAlign: 'middle'
                        }}
                      />
                    )}
                  </td>

                  <td style={td}>{row.total_points}</td>
                  <td style={td}>{row.mulligans_used}/2</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ANIMATIONS */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0 }
          to { opacity: 1 }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0 }
          to { transform: translateY(0); opacity: 1 }
        }
      `}</style>
    </div>
  )
}

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
