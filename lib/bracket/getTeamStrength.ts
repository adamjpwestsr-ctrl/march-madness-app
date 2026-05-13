export function getTeamStrength(conference: string) {
  const power5 = ['ACC', 'SEC', 'Big Ten', 'Big 12', 'Pac-12'];
  const highMajor = ['Big East', 'AAC', 'Mountain West'];
  const midMajor = ['A-10', 'WCC', 'MVC', 'Sun Belt', 'CAA', 'SoCon'];
  const lowMajor = [
    'MAAC', 'NEC', 'Patriot', 'Big South', 'Horizon', 'Southland',
    'Summit', 'America East', 'ASUN', 'Big Sky'
  ];

  if (power5.includes(conference)) {
    return { label: 'Power 5', emoji: '💪' };
  }
  if (highMajor.includes(conference)) {
    return { label: 'High-Major', emoji: '🔥' };
  }
  if (midMajor.includes(conference)) {
    return { label: 'Mid-Major', emoji: '⚡' };
  }
  if (lowMajor.includes(conference)) {
    return { label: 'Low-Major', emoji: '🌱' };
  }
  if (conference === 'Ivy League') {
    return { label: 'Ivy League', emoji: '🎓' };
  }

  return { label: 'Unknown', emoji: '❔' };
}
