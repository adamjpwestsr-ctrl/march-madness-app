'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { getTeamLogo } from '../../lib/getTeamLogo'
import MulliganModal from '../../components/bracket/MulliganModal'
import TeamHoverCard from '../../components/TeamHoverCard'
import BadgeGrid from "@/components/BadgeGrid";


const TEAM_BLOCK_HEIGHT = 52
const ROUND_COLUMN_WIDTH = 150

type MulliganModalProps = {
  isOpen: boolean;
  onClose: () => void;
  game: Game | null;
  aliveTeams: string[];
  onSubmit: (team: string) => void | Promise<void>;
}

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
  const userId = 1

  const [games, setGames] = useState<Game[]>([])
  const [picks, setPicks] = useState<Picks>({})
  const [highlightFinalFourPath, setHighlightFinalFourPath] = useState(false)
  const [showMulliganModal, setShowMulliganModal] = useState(false)
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [showTooltip, setShowTooltip] = useState<number | null>(null)
  const [tiebreaker, setTiebreaker] = useState('')
  const [hoveredTeam, setHoveredTeam] = useState<string | null>(null)

  const openMulliganRequestModal = (game: Game) => {
    setSelectedGame(game)
    setShowMulliganModal(true)
  }

  const submitMulliganRequest = async (
    game: Game | null,
    replacementTeam: string
  ) => {
    if (!game) return

    const { error } = await supabase.from('mulligan_requests').insert({
      user_id: userId,
      game_id: game.game_id,
      original_team: picks[game.game_id] ?? null,
      replacement_team: replacementTeam,
      status: 'pending'
    })

    if (error) {
      console.error('Mulligan request failed:', error)
    }
  }

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
  try {
    if (!tiebreaker) {
      alert('Please enter a tiebreaker score before submitting.')
      return
    }

    if (Object.keys(picks).length === 0) {
      alert('Please make some picks before submitting.')
      return
    }

    const user_id = userId; // replace with session user later

    // 1. Create a new bracket row
    const { data: bracket, error: bracketError } = await supabase
      .from('brackets')
      .insert({
        user_id,
        bracket_name: 'Main Bracket'
      })
      .select()
      .single();

    if (bracketError || !bracket) {
      console.error('Error creating bracket:', bracketError);
      alert('Error creating bracket');
      return;
    }

    const bracketId = bracket.bracket_id;

    // 2. Insert submission metadata
    const { error: submissionError } = await supabase
      .from('bracket_submissions')
      .insert({
        bracket_id: bracketId,
        tiebreaker,
        submitted_at: new Date().toISOString()
      });

    if (submissionError) {
      console.error('Error saving submission:', submissionError);
      alert('Error submitting bracket');
      return;
    }

    // 3. Insert all picks with bracket_id
    const picksArray = Object.entries(picks).map(([gameId, team]) => ({
      bracket_id: bracketId,
      game_id: parseInt(gameId),
      selected_team: team
    }));

    const { error: picksError } = await supabase
      .from('picks')
      .insert(picksArray);

    if (picksError) {
      console.error('Error saving picks:', picksError);
      alert('Error submitting bracket');
      return;
    }

    alert('Bracket submitted!');
  } catch (err) {
    console.error('Unexpected error:', err);
    alert('Error submitting bracket');
  }
};


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

  const isEligibleForMulligan = (game: Game) => {
    const selected = picks[game.game_id]
    if (!selected) return false
    // Simple rule: only allow from Sweet 16 and later
    return game.round >= 3
  }

  const aliveTeams: string[] = Array.from(
    new Set(
      games
        .flatMap(g => [g.team1, g.team2])
        .filter((t): t is string => !!t)
    )
  )

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
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: isInFinalFourPath ? '#16A34A' : '#1D4ED8',
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
    <div style={{ marginBottom: 10, position: 'relative', paddingLeft: 0 }}>

      {/* TEAM 1 BUTTON */}
      <div
        style={{
          position: 'relative',
          display: 'block',
          width: '100%',
        }}
        onMouseEnter={() => {
          if (!game.team1) return
          setHoveredTeam(game.team1)
        }}
        onMouseLeave={() => setHoveredTeam(null)}
      >
        <button
          disabled={disabled}
          onClick={() => handlePick(game.game_id, game.team1)}
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

        {hoveredTeam === game.team1 && (
          <TeamHoverCard team={game.team1 ?? ''} />
        )}
      </div>

      {/* TEAM 2 BUTTON */}
      <div
        style={{
          position: 'relative',
          display: 'block',
          width: '100%',
        }}
        onMouseEnter={() => {
          if (!game.team2) return
          setHoveredTeam(game.team2)   // ✅ FIXED (was incorrectly team1)
        }}
        onMouseLeave={() => setHoveredTeam(null)}
      >
        <button
          disabled={disabled}
          onClick={() => handlePick(game.game_id, game.team2)}
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

        {hoveredTeam === game.team2 && (
          <TeamHoverCard team={game.team2 ?? ''} />   // ✅ FIXED nullability
        )}
      </div>

      {/* MULLIGAN BUTTON */}
      {isEligibleForMulligan(game) && (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <button
            onClick={() => openMulliganRequestModal(game)}
            onMouseEnter={() => setShowTooltip(game.game_id)}
            onMouseLeave={() => setShowTooltip(null)}
            style={{
              marginLeft: 8,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: 18,
              color: '#e5e7eb',
              opacity: 0.85,
              transition: 'opacity 0.15s ease'
            }}
          >
            ⟳
          </button>

          {showTooltip === game.game_id && (
            <div
              style={{
                position: 'absolute',
                top: '120%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 260,
                background: 'rgba(15,23,42,0.95)',
                color: '#e5e7eb',
                padding: '12px 14px',
                borderRadius: 8,
                boxShadow: '0 6px 18px rgba(0,0,0,0.45)',
                fontSize: 12,
                zIndex: 9999,
                lineHeight: 1.45
              }}
            >
              <strong style={{ fontSize: 13 }}>Mulligan</strong>
              <br /><br />
              • Replace a team you picked that has already lost.<br />
              • Only allowed if the team was originally projected to reach the Sweet 16 or deeper.<br />
              • Choose any team still alive in the tournament.<br />
              • Only the games where you originally advanced that team will update.<br />
              • Mulligans allow points for future rounds.<br />
              • You get 2 total Mulligans.<br />
              • Mulligans require admin approval.<br />
              • Mulligan picks are marked with a ⭐ on the leaderboard.
            </div>
          )}
        </div>
      )}
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
        height: '100vh',
        color: '#e5e7eb',
        overflowY: 'auto'
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
        Bracket Busters 2026 March Madness Bracket
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
            boxShadow: '0 3px 8px rgba(0,0,0,0.25)',
            marginRight: 10
          }}
        >
          {highlightFinalFourPath
            ? 'Hide path to Final Four'
            : 'Show my path to Final Four'}
        </button>

        <button
          onClick={resetBracket}
          style={{
            padding: '8px 16px',
            fontSize: 14,
            background: '#64748b',
            color: 'white',
            borderRadius: 999,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 3px 8px rgba(0,0,0,0.25)',
            marginRight: 10
          }}
        >
          Clear Bracket
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          justifyContent: 'center',
          gridTemplateAreas: `
            "east     finalfour   west"
            "east     champ       west"
            "south    .           midwest"
          `,
          gridTemplateColumns: '1fr auto 1fr',
          gap: 32,
          overflowX: 'visible',
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
                padding: 10,
                background: 'rgba(15,23,42,0.96)',
                border: '1px solid rgba(148,163,184,0.45)',
                boxShadow: '0 12px 30px rgba(0,0,0,0.45)',
                minWidth: 'fit-content',
                width:
                  region === 'Final Four' || region === 'Championship'
                    ? 150
                    : 'auto'
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

              <div
                style={{
                  display: 'grid',
                  gridAutoFlow: 'column',
                  gridAutoColumns: `${ROUND_COLUMN_WIDTH}px`,
                  columnGap: 8,
                  alignItems: 'flex-start',
                  overflow: 'visible'
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
                    {rounds[round]?.map((game, index) => (
                      <div
                        key={game.game_id}
                        className={`game-node ${
                          index % 2 === 0 ? 'top' : 'bottom'
                        }`}
                        style={{ position: 'relative' }}
                      >
                        {renderGameButtons(game)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

{region === 'Championship' && (
  <>
    <div
      style={{
        marginTop: 20,
        textAlign: 'center',
        paddingTop: 12,
        borderTop: '1px solid rgba(148,163,184,0.35)'
      }}
    >
      <input
        type="number"
        value={tiebreaker}
        onChange={e => setTiebreaker(e.target.value)}
        style={{
          padding: '8px 12px',
          borderRadius: 8,
          border: '1px solid #475569',
          fontSize: 14,
          width: 120,
          background: '#1e293b',
          color: '#f1f5f9',
          marginBottom: 6,
        }}
      />

      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: '#e5e7eb',
          lineHeight: 1.2
        }}
      >
        Tiebreaker
        <br />
        <span style={{ opacity: 0.8 }}>
          (Total Final Score)
        </span>
      </div>
    </div>

    <div style={{ marginTop: 20, textAlign: 'center' }}>
      <button
        onClick={submitBracket}
        style={{
          padding: '10px 20px',
          fontSize: 16,
          background: '#16A34A',
          color: 'white',
          borderRadius: 999,
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 3px 8px rgba(0,0,0,0.25)'
        }}
      >
        Submit Bracket
      </button>
    </div>
   </>
)}
      </div>
  );
})}
  </div>
</div>
);
}

