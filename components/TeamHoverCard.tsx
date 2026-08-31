'use client'

import React from 'react'
import { getTeamData } from '../lib/getTeamData'
import type { TeamData, CfbdTeam } from '../types/types'

export default function TeamHoverCard({ team }: { team: string }) {
  const data = getTeamData(team)
  if (!data) return null

  // Runtime type check
  const isMarchMadness = "seed" in data

  return (
    <div
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        transform: 'translateY(12px)',
        padding: '12px 16px',
        borderRadius: 10,
        width: 260,
        zIndex: 9999,
        boxShadow: '0 8px 20px rgba(0,0,0,0.45)',
        animation: 'fadeScale 0.15s ease-out'
      }}
    >
      <h3 style={{ margin: 0, marginBottom: 6, color: '#e5e7eb', fontSize: 16 }}>
        {team}
        {isMarchMadness && ` (Seed ${(data as unknown as TeamData).seed})`}
        {!isMarchMadness && (data as CfbdTeam).rank && ` (Rank ${(data as CfbdTeam).rank})`}
      </h3>

      <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.4 }}>
        {isMarchMadness ? (
          (() => {
            const mm = data as TeamData

            return (
              <>
                <div><strong>Record:</strong> {mm.record}</div>
                <div><strong>Conf:</strong> {mm.conference_record} ({mm.conference})</div>
                <div><strong>NET:</strong> {mm.net}</div>
                <div><strong>KenPom:</strong> {mm.kenpom}</div>
                <div><strong>AdjO:</strong> {mm.adj_o}</div>
                <div><strong>AdjD:</strong> {mm.adj_d}</div>
                <div><strong>Quad 1:</strong> {mm.quad1}</div>
                <div><strong>Quad 2:</strong> {mm.quad2}</div>
                <div><strong>Best Win:</strong> {mm.best_win}</div>
                <div><strong>Worst Loss:</strong> {mm.worst_loss}</div>
                <div><strong>Streak:</strong> {mm.streak}</div>
                <div><strong>Last 10:</strong> {mm.last10}</div>
              </>
            )
          })()
        ) : (
          (() => {
            const cfbd = data as CfbdTeam

            return (
              <>
                <div><strong>Conference:</strong> {cfbd.conference}</div>
                <div><strong>Mascot:</strong> {cfbd.mascot}</div>
                <div><strong>Location:</strong> {cfbd.location.city}, {cfbd.location.state}</div>
                {cfbd.rank && <div><strong>Rank:</strong> {cfbd.rank}</div>}
              </>
            )
          })()
        )}
      </div>

      <style>{`
        @keyframes fadeScale {
          from {
            opacity: 0;
            transform: translateY(-50%) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(-50%) scale(1);
          }
        }
      `}</style>
    </div>
  )
}
