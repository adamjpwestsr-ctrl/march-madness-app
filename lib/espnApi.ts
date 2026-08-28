export async function espnFetch(endpoint: string) {
  const url = `https://site.api.espn.com/apis/site/v2/sports/football/college-football/${endpoint}`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`ESPN API error: ${res.status}`);
  return res.json();
}
