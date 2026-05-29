import { NextResponse } from "next/server";

export async function GET() {
  const byeWeeks = {
    5: ["CAR", "KC"],
    6: ["CIN", "DET", "MIA", "MIN"],
    7: ["BUF", "JAX", "LAC", "WAS"],
    8: ["HOU", "NO", "NYG", "SF"],
    9: ["PIT", "TEN"],
    10: ["CHI", "DEN", "PHI", "TB"],
    11: ["ATL", "CLE", "GB", "LAR", "NE", "SEA"],
    13: ["BAL", "IND", "LV", "NYJ"],
    14: ["ARI", "DAL"],
  };

  return NextResponse.json(byeWeeks);
}
