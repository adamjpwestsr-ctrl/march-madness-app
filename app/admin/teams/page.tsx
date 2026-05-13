"use client";

import { useEffect, useState } from "react";
import { Team, CONFERENCE_STRENGTH_MAP } from "@/lib/bracketTypes";
import { supabase } from "@/lib/supabaseClient";

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  const [form, setForm] = useState({
    name: "",
    seed: "",
    region: "",
    record: "",
    conference: "",
  });

  // Load teams
  useEffect(() => {
    loadTeams();
  }, []);

  async function loadTeams() {
    setLoading(true);
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .order("seed", { ascending: true });

    if (!error && data) setTeams(data as Team[]);
    setLoading(false);
  }

  // Handle form changes
  function updateForm(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // Save (create or update)
  async function saveTeam() {
    const payload = {
      name: form.name,
      seed: Number(form.seed),
      region: form.region,
      record: form.record,
      conference: form.conference,
    };

    if (editingTeam) {
      // Update
      await supabase.from("teams").update(payload).eq("id", editingTeam.id);
    } else {
      // Create
      await supabase.from("teams").insert(payload);
    }

    setForm({
      name: "",
      seed: "",
      region: "",
      record: "",
      conference: "",
    });
    setEditingTeam(null);
    loadTeams();
  }

  // Edit
  function startEdit(team: Team) {
    setEditingTeam(team);
    setForm({
      name: team.name,
      seed: String(team.seed),
      region: team.region,
      record: team.record,
      conference: team.conference,
    });
  }

  // Delete
  async function deleteTeam(id: number) {
    await supabase.from("teams").delete().eq("id", id);
    loadTeams();
  }

  const conferenceOptions = Object.keys(CONFERENCE_STRENGTH_MAP);
  const regions = ["East", "West", "South", "Midwest"];

  return (
    <div className="admin-page">
      <h1 className="admin-title">Team Management</h1>

      {/* FORM */}
      <div className="admin-form">
        <h2>{editingTeam ? "Edit Team" : "Add Team"}</h2>

        <div className="form-grid">
          <input
            type="text"
            placeholder="Team Name"
            value={form.name}
            onChange={(e) => updateForm("name", e.target.value)}
          />

          <input
            type="number"
            placeholder="Seed"
            value={form.seed}
            onChange={(e) => updateForm("seed", e.target.value)}
          />

          <select
            value={form.region}
            onChange={(e) => updateForm("region", e.target.value)}
          >
            <option value="">Select Region</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Record (e.g. 28–4)"
            value={form.record}
            onChange={(e) => updateForm("record", e.target.value)}
          />

          <select
            value={form.conference}
            onChange={(e) => updateForm("conference", e.target.value)}
          >
            <option value="">Select Conference</option>
            {conferenceOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <button className="save-button" onClick={saveTeam}>
          {editingTeam ? "Update Team" : "Add Team"}
        </button>
      </div>

      {/* TEAM LIST */}
      <div className="team-list">
        <h2>Teams</h2>

        {loading ? (
          <p>Loading…</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Seed</th>
                <th>Name</th>
                <th>Region</th>
                <th>Record</th>
                <th>Conference</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {teams.map((team) => (
                <tr key={team.id}>
                  <td>{team.seed}</td>
                  <td>{team.name}</td>
                  <td>{team.region}</td>
                  <td>{team.record}</td>
                  <td>{team.conference}</td>

                  <td className="actions">
                    <button onClick={() => startEdit(team)}>Edit</button>
                    <button
                      className="danger"
                      onClick={() => deleteTeam(team.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
