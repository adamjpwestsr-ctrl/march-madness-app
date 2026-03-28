import rawTeams from '../data/teams.json'
import { TeamData } from '../types/types'

// Tell TypeScript this JSON is a dictionary keyed by string
const teams = rawTeams as Record<string, TeamData>

export function getTeamData(teamName: string) {
  if (!teamName) return null
  return teams[teamName] || null
}
