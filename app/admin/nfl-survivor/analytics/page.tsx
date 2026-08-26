// /app/admin/nfl-survivor/analytics/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

export default function SurvivorAnalyticsPage() {
  const [survivalCurve, setSurvivalCurve] = useState<any[]>([]);
  const [pickDistribution, setPickDistribution] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const curveRes = await fetch("/api/nfl/survivor/analytics/survival");
      const curveData = await curveRes.json();
      setSurvivalCurve(curveData.rows || []);

      const distRes = await fetch("/api/nfl/survivor/analytics/picks");
      const distData = await distRes.json();
      setPickDistribution(distData.rows || []);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-10">
      <h1 className="text-3xl font-bold mb-6">NFL Survivor — Analytics</h1>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Survival Curve</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={survivalCurve}>
                <XAxis dataKey="week" />
                <Tooltip />
                <Line type="monotone" dataKey="alivecount" stroke="#10b981" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Pick Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pickDistribution}>
                <XAxis dataKey="team_abbrev" />
                <Tooltip />
                <Bar dataKey="pickcount" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
