'use client'

import React from 'react'
import { getTeamData } from '../lib/getTeamData'

export default function TeamHoverCard({ team }: { team: string }) {
  const data = getTeamData(team)
  if (!data) return null

  return (
    <div
      style={{
        position: 'absolute',

        // TEMP DEBUG POSITION
        top: '100%',
        left: 0,
        transform: 'translateY(12px)',

        // TEMP DEBUG VISIBILITY HELPERS
        border: '3px solid yellow',
        background: 'rgba(255,255,0,0.3)',

        // NORMAL CARD STYLING
        padding: '12px 16px',
        borderRadius: 10,
        width: 260,
        zIndex: 9999,
        boxShadow: '0 8px 20px rgba(0,0,0,0.45)',
        animation: 'fadeScale 0.15s ease-out'
      }}
    >
      <h3 style={{ margin: 0, marginBottom: 6, color: '#e5e7eb', fontSize: 16 }}>
        {team} (Seed {data.seed})
      </h3>

      <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.4 }}>
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
