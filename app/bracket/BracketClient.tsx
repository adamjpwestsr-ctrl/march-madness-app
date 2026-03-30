'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { getTeamLogo } from '../../lib/getTeamLogo'
import MulliganModal from '../../components/bracket/MulliganModal'
import TeamHoverCard from '../../components/TeamHoverCard'
import BadgeGrid from "@/components/BadgeGrid";

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

export default function BracketClient({ session }: { session: any }) {
  const userId = session?.userId ?? 1

  const [games, setGames] = useState<Game[]>([])
  const [picks, setPicks] = useState<Picks>({})
  const [highlightFinalFourPath, setHighlightFinalFourPath] = useState(false)
  const [showMulliganModal, setShowMulliganModal] = useState(false)
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [showTooltip, setShowTooltip] = useState<number | null>(null)
  const [tiebreaker, setTiebreaker] = useState('')
  const [hoveredTeam, setHoveredTeam] = useState<string | null>(null)

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

      const user_id = userId

      const { data: bracket, error: bracketError } = await supabase
        .from('brackets')
        .insert({
          user_id,
          bracket_name: 'Main Bracket'
        })
        .select()
        .single()

      if (bracketError || !bracket) {
        console.error('Error creating bracket:', bracketError)
        alert('Error creating bracket')
        return
      }

      const bracketId = bracket.bracket_id

      const { error: submissionError } = await supabase
        .from('bracket_submissions')
        .insert({
          bracket_id: bracketId,
          tiebreaker,
          submitted_at: new Date().toISOString()
        })

      if (submissionError) {
        console.error('Error saving submission:', submissionError)
        alert('Error submitting bracket')
        return
      }

      const picksArray = Object.entries(picks).map(([gameId, team]) => ({
        bracket_id: bracketId,
        game_id: parseInt(gameId),
        selected_team: team
      }))

      const { error: picksError } = await supabase
        .from('picks')
        .insert(picksArray)

      if (picksError) {
        console.error('Error saving picks:', picksError)
        alert('Error submitting bracket')
        return
      }

      alert('Bracket submitted!')
    } catch (err) {
      console.error('Unexpected error:', err)
      alert('Error submitting bracket')
    }
  }

  return (
    <div>
      <h1>Welcome, {session?.email}</h1>
      {/* Your full bracket UI goes here */}
    </div>
  )
}
