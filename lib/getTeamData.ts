import teams from '../data/teams.json'

export function getTeamData(teamName: string) {
  if (!teamName) return null
  return teams[teamName] || null
}
