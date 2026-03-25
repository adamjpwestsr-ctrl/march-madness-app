import { autoAliases } from './autoAliases'

export const teamNameAliases: Record<string, string> = {
  // Your manual overrides
  "Ohio St": "Ohio State",
  "St Johns": "St. John's",
  "Mich St": "Michigan State",
  "UNC": "North Carolina",
  "St Mary": "Saint Mary's",
  "Vandy": "Vanderbilt",
  "UCONN": "Connecticut",
  "Miami U": "Miami (FL)",
  "Miami Ohio": "Miami (OH)",

  // Auto-generated common aliases
  ...autoAliases
}
