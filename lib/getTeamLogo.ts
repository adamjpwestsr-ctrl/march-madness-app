import { teamLogos } from './teamLogos'
import { teamNameAliases } from './teamNameAliases'

const loggedMissing: Set<string> = new Set()

export const getTeamLogo = (rawName: string | null) => {
  if (!rawName) return null

  const official = teamNameAliases[rawName] ?? rawName
  const logo = teamLogos[official]

  if (!logo && !loggedMissing.has(rawName)) {
    loggedMissing.add(rawName)

    console.warn(
      `%c[LOGO MISSING]`,
      'color: red; font-weight: bold;',
      `No logo found for team: "${rawName}".`,
      `Resolved official name: "${official}".`
    )

    // Optional: Suggest closest match
    const suggestions = Object.keys(teamLogos)
      .filter(name => name.toLowerCase().includes(rawName.toLowerCase()))
      .slice(0, 5)

    if (suggestions.length > 0) {
      console.warn(`Closest matches:`, suggestions)
    }
  }

  return logo ?? null
}
