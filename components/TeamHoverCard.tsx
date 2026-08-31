'use client'

import React from 'react'
import { getTeamData } from '../lib/getTeamData'

export default function TeamHoverCard({ team }: { team: string }) {
  const data = getTeamData(team)
  if (!data) return null

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
        {isMarchMadness && ` (Seed ${data.seed})`}
        {!isMarchMadness && data.rank && ` (Rank ${data.rank})`}
      </h3>

      <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.4 }}>
        {isMarchMadness ? (
          <>
            <div><strong>Record:</strong> {data.record}</div>
            <div><strong>Conf:</strong> {data.conference_record} ({data.conference})</div>
            <div><strong>NET:</strong> {data.net}</div>
            <div><strong>KenPom:</strong> {data.kenpom}</div>
            <div><strong>AdjO:</strong> {data.adj_o}</div>
            <div><strong>AdjD:</strong> {data.adj_d}</div>
            <div><strong>Quad 1:</strong> {data.quad1}</div>
            <div><strong>Quad 2:</strong> {data.quad2}</div>
            <div><strong>Best Win:</strong> {data.best_win}</div>
            <div><strong>Worst Loss:</strong> {data.worst_loss}</div>
            <div><strong>Streak:</strong> {data.streak}</div>
            <div><strong>Last 10:</strong> {data.last10}</div>
          </>
        ) : (
          <>
            <div><strong>Conference:</strong> {data.conference}</div>
            <div><strong>Mascot:</strong> {data.mascot}</div>
            <div><strong>Location:</strong> {data.location.city}, {data.location.state}</div>
            {data.rank && <div><strong>Rank:</strong> {data.rank}</div>}
          </>
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
