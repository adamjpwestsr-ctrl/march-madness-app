'use client';

import { useEffect, useState } from 'react';

type Team = {
  id: number;
  team_name: string;
  logo_url?: string;
  conference?: string;
  record?: string;
};

type TournamentTeam = {
  baseTeamId: number;
  team_name: string;
  region: 'East' | 'West' | 'South' | 'Midwest';
  seed: number; // 1–22 (17–22 = opening round)
  record: string;
  true_seed?: number;
};

type OpeningGame = {
  team1_id: number | null;
  team2_id: number | null;
  winner_to_game_number: number | null; // Round of 64 game #
};

type Round64Game = {
  game_number: number;
  region: 'East' | 'West' | 'South' | 'Midwest';
  team1_source: { type: 'team' | 'opening_winner'; value: number | null };
  team2_source: { type: 'team' | 'opening_winner'; value: number | null };
};

const REGIONS: Array<'East' | 'West' | 'South' | 'Midwest'> = [
  'East',
  'West',
  'South',
  'Midwest',
];

type StepKey =
  | 'selectTeams'
  | 'openingRound'
  | 'round64'
  | 'autoGenerate'
  | 'validate'
  | 'publish';

const STEP_ORDER: StepKey[] = [
  'selectTeams',
  'openingRound',
  'round64',
  'autoGenerate',
  'validate',
  'publish',
];

const STEP_LABELS: Record<StepKey, string> = {
  selectTeams: 'Select Teams & Seeds',
  openingRound: 'Opening Round',
  round64: 'Round of 64',
  autoGenerate: 'Auto‑Generate Bracket',
  validate: 'Validate Tournament',
  publish: 'Publish Tournament',
};

export default function TournamentBuilder() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [tournamentTeams, setTournamentTeams] = useState<TournamentTeam[]>([]);
  const [openingGames, setOpeningGames] = useState<OpeningGame[]>(
    Array.from({ length: 12 }).map(() => ({
      team1_id: null,
      team2_id: null,
      winner_to_game_number: null,
    }))
  );
  const [round64Games, setRound64Games] = useState<Round64Game[]>(
    Array.from({ length: 32 }).map((_, idx) => ({
      game_number: idx + 1,
      region: idx < 8 ? 'East' : idx < 16 ? 'West' : idx < 24 ? 'South' : 'Midwest',
      team1_source: { type: 'team', value: null },
      team2_source: { type: 'team', value: null },
    }))
  );

  const [step, setStep] = useState<StepKey>('selectTeams');
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const [message, setMessage] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [validating, setValidating] = useState(false);
  const [loading, setLoading] = useState(false);

  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [formRegion, setFormRegion] = useState<'East' | 'West' | 'South' | 'Midwest' | ''>('');
  const [formSeed, setFormSeed] = useState<number | ''>('');
  const [formRecord, setFormRecord] = useState<string>('');
  const [formTrueSeed, setFormTrueSeed] = useState<number | ''>('');
  const [teamSearch, setTeamSearch] = useState<string>('');

  // Load all Division I teams
  useEffect(() => {
    async function loadTeams() {
      try {
        const res = await fetch('/api/march-madness/admin/teams');
        const json = await res.json();
        setTeams(json.teams ?? []);
      } catch (err) {
        console.error('Failed to load teams', err);
      }
    }
    loadTeams();
  }, []);

  function openStep(stepKey: StepKey) {
    setStep(stepKey);
    setModalOpen(true);
    setMessage(null);
  }

  function closeModal() {
    setModalOpen(false);
    setMessage(null);
  }

  function getStepIndex(stepKey: StepKey) {
    return STEP_ORDER.indexOf(stepKey) + 1;
  }

  function resetTeamForm() {
    setSelectedTeam(null);
    setFormRegion('');
    setFormSeed('');
    setFormRecord('');
    setFormTrueSeed('');
  }

  function openTeamForm(team: Team) {
    setSelectedTeam(team);
    setFormRegion('');
    setFormSeed('');
    setFormRecord(team.record ?? '');
    setFormTrueSeed('');
  }

  function addTournamentTeam() {
    if (!selectedTeam || !formRegion || !formSeed || !formRecord) return;

    const newEntry: TournamentTeam = {
      baseTeamId: selectedTeam.id,
      team_name: selectedTeam.team_name,
      region: formRegion,
      seed: Number(formSeed),
      record: formRecord,
      true_seed: formTrueSeed ? Number(formTrueSeed) : undefined,
    };

    const conflict = tournamentTeams.find(
      (t) => t.region === newEntry.region && t.seed === newEntry.seed
    );
    if (conflict) {
      setMessage(
        `Seed ${newEntry.seed} in ${newEntry.region} is already assigned to ${conflict.team_name}.`
      );
      return;
    }

    setTournamentTeams((prev) => [...prev, newEntry]);
    resetTeamForm();
    setMessage(null);
  }

  async function saveTournamentTeams() {
    try {
      setLoading(true);
      setMessage(null);

      const res = await fetch(
        '/api/march-madness/admin/tournament/select-teams',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teams: tournamentTeams.map((t) => ({
              base_team_id: t.baseTeamId,
              team_name: t.team_name,
              region: t.region,
              seed: t.seed,
              record: t.record,
              true_seed: t.true_seed ?? null,
            })),
          }),
        }
      );

      const json = await res.json();

      if (!res.ok) {
        setMessage(`Error saving tournament teams: ${json.error ?? 'Unknown error'}`);
      } else {
        setMessage('✅ Tournament teams saved successfully.');
      }
    } catch (err: any) {
      setMessage(`Error saving tournament teams: ${err.message ?? err}`);
    } finally {
      setLoading(false);
    }
  }

  async function saveOpeningRound() {
    try {
      setLoading(true);
      setMessage(null);

      const res = await fetch(
        '/api/march-madness/admin/tournament/opening-round',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ games: openingGames }),
        }
      );

      const json = await res.json();
      if (!res.ok) {
        setMessage(`Error saving opening round: ${json.error ?? 'Unknown error'}`);
      } else {
        setMessage(`Opening round saved: ${JSON.stringify(json)}`);
      }
    } catch (err: any) {
      setMessage(`Error saving opening round: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function saveRound64() {
    try {
      setLoading(true);
      setMessage(null);

      const res = await fetch(
        '/api/march-madness/admin/tournament/round64',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ games: round64Games }),
        }
      );

      const json = await res.json();
      if (!res.ok) {
        setMessage(`Error saving Round of 64: ${json.error ?? 'Unknown error'}`);
      } else {
        setMessage(`Round of 64 saved: ${JSON.stringify(json)}`);
      }
    } catch (err: any) {
      setMessage(`Error saving Round of 64: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function autoGenerateTournament() {
    try {
      setLoading(true);
      setMessage('Generating full tournament...');
      const res = await fetch(
        '/api/march-madness/admin/tournament/build-all',
        { method: 'POST' }
      );
      const json = await res.json();
      if (!res.ok) {
        setMessage(`Error generating tournament: ${json.error ?? 'Unknown error'}`);
      } else {
        setMessage(`Tournament generated: ${JSON.stringify(json)}`);
      }
    } catch (err: any) {
      setMessage(`Error generating tournament: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function runValidation() {
    try {
      setValidating(true);
      setValidationResult(null);

      const res = await fetch(
        '/api/march-madness/admin/tournament/validate',
        { method: 'POST' }
      );

      const json = await res.json();
      setValidationResult(json);
    } catch (err: any) {
      setValidationResult({
        ok: false,
        errors: [`Validation request failed: ${err.message}`],
        warnings: [],
      });
    } finally {
      setValidating(false);
    }
  }

  async function publishTournament() {
    try {
      setLoading(true);
      setMessage('Publishing tournament...');
      const res = await fetch(
        '/api/march-madness/admin/tournament/publish',
        { method: 'POST' }
      );
      const json = await res.json();
      if (!res.ok) {
        setMessage(`Publish failed: ${json.error ?? 'Unknown error'}`);
      } else {
        setMessage(JSON.stringify(json, null, 2));
      }
    } catch (err: any) {
      setMessage(`Publish failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  const filteredTeams = teams.filter((t) =>
    t.team_name.toLowerCase().includes(teamSearch.toLowerCase())
  );

  const openingTeams = tournamentTeams.filter(
    (t) => t.seed >= 17 && t.seed <= 22
  );
  const round64Teams = tournamentTeams.filter((t) => t.seed >= 1 && t.seed <= 16);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 mb-10">
      <h2 className="text-3xl font-bold mb-6 text-yellow-400">
        Tournament Builder (2027 – 88 Teams)
      </h2>

      {/* Step selector */}
      <div className="flex flex-wrap gap-3 mb-8">
        {STEP_ORDER.map((key) => (
          <button
            key={key}
            onClick={() => openStep(key)}
            className={`px-4 py-2 rounded-lg text-sm ${
              step === key
                ? 'bg-yellow-500 text-black'
                : 'bg-slate-700 text-gray-300'
            }`}
          >
            {STEP_LABELS[key]}
          </button>
        ))}
      </div>

      {message && (
        <div className="mb-4 text-sm text-yellow-300 font-mono whitespace-pre-wrap">
          {message}
        </div>
      )}

      {/* Quick summary */}
      <div className="text-sm text-gray-300 mb-4">
        <div>Selected teams: {tournamentTeams.length} (target: 88)</div>
        <div>Opening round games configured: {openingGames.filter(
          g => g.team1_id && g.team2_id && g.winner_to_game_number
        ).length} / 12</div>
        <div>Round of 64 games configured: {round64Games.filter(
          g => g.team1_source.value && g.team2_source.value
        ).length} / 32</div>
      </div>

      {/* Large modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 w-full max-w-[1000px] shadow-xl relative">
            {/* Close */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-200"
            >
              ✕
            </button>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="text-sm text-gray-300 mb-2">
                Step {getStepIndex(step)} of {STEP_ORDER.length} — {STEP_LABELS[step]}
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-2 bg-yellow-500 transition-all"
                  style={{
                    width: `${(getStepIndex(step) / STEP_ORDER.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Step content */}
            {step === 'selectTeams' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: All teams */}
                <div>
                  <h3 className="text-xl font-bold mb-3">All Division I Teams</h3>
                  <p className="text-sm text-gray-400 mb-3">
                    Click a team to add it to the tournament and assign region, seed, and record.
                    You should end up with exactly 88 teams.
                  </p>

                  <input
                    className="w-full p-2 mb-3 rounded-lg bg-slate-700 border border-slate-500 text-sm"
                    placeholder="Search teams..."
                    value={teamSearch}
                    onChange={(e) => setTeamSearch(e.target.value)}
                  />

                  <div className="max-h-[400px] overflow-y-auto space-y-1">
                    {filteredTeams.map((team) => {
                      const alreadySelected = tournamentTeams.some(
                        (t) => t.baseTeamId === team.id
                      );
                      return (
                        <button
                          key={team.id}
                          onClick={() => openTeamForm(team)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm border ${
                            alreadySelected
                              ? 'bg-green-700 border-green-500 text-gray-100'
                              : 'bg-slate-700 border-slate-600 text-gray-200'
                          }`}
                        >
                          {team.team_name}
                          {team.conference && (
                            <span className="ml-2 text-xs text-gray-400">
                              ({team.conference})
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right: form */}
                <div>
                  <h3 className="text-xl font-bold mb-3">Assign Region, Seed & Record</h3>

                  {!selectedTeam && (
                    <p className="text-sm text-gray-400">
                      Select a team on the left to assign its tournament details.
                    </p>
                  )}

                  {selectedTeam && (
                    <div className="space-y-4">
                      <div className="text-lg font-semibold text-gray-100">
                        {selectedTeam.team_name}
                      </div>

                      {/* Region */}
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">
                          Region
                        </label>
                        <select
                          className="w-full p-2 rounded-lg bg-slate-700 border border-slate-500 text-sm"
                          value={formRegion}
                          onChange={(e) =>
                            setFormRegion(
                              e.target.value as 'East' | 'West' | 'South' | 'Midwest'
                            )
                          }
                        >
                          <option value="">Select region...</option>
                          {REGIONS.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Seed */}
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">
                          Seed (1–22, 17–22 are opening‑round seeds)
                        </label>
                        <select
                          className="w-full p-2 rounded-lg bg-slate-700 border border-slate-500 text-sm"
                          value={formSeed}
                          onChange={(e) => setFormSeed(Number(e.target.value))}
                        >
                          <option value="">Select seed...</option>
                          {Array.from({ length: 22 }).map((_, idx) => {
                            const seed = idx + 1;
                            return (
                              <option key={seed} value={seed}>
                                {seed}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      {/* Record */}
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">
                          Record (e.g. 24-7)
                        </label>
                        <input
                          className="w-full p-2 rounded-lg bg-slate-700 border border-slate-500 text-sm"
                          value={formRecord}
                          onChange={(e) => setFormRecord(e.target.value)}
                          placeholder="24-7"
                        />
                      </div>

                      {/* True Seed */}
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">
                          True Seed (optional, overall seed number)
                        </label>
                        <input
                          type="number"
                          className="w-full p-2 rounded-lg bg-slate-700 border border-slate-500 text-sm"
                          value={formTrueSeed}
                          onChange={(e) =>
                            setFormTrueSeed(
                              e.target.value ? Number(e.target.value) : ''
                            )
                          }
                          placeholder="e.g. 48"
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={addTournamentTeam}
                          className="px-4 py-2 rounded-lg bg-yellow-500 text-black text-sm"
                        >
                          Add to Tournament
                        </button>
                        <button
                          onClick={resetTeamForm}
                          className="px-4 py-2 rounded-lg bg-slate-600 text-gray-100 text-sm"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="mt-4 text-sm text-gray-300">
                        Total selected teams: {tournamentTeams.length} (target: 88)
                      </div>

                      <button
                        onClick={saveTournamentTeams}
                        disabled={loading}
                        className="mt-4 px-5 py-2 rounded-lg bg-yellow-500 text-black text-sm disabled:opacity-50"
                      >
                        {loading ? 'Saving...' : 'Save Tournament Teams to Database'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 'openingRound' && (
              <div>
                <h3 className="text-xl font-bold mb-4">Opening Round — 12 Games</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Seeds 17–22 in each region play in the opening round. Select the matchups
                  and choose which Round of 64 game the winner advances to.
                </p>

                <div className="space-y-6 max-h-[500px] overflow-y-auto">
                  {openingGames.map((game, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900 border border-slate-700 rounded-lg p-4"
                    >
                      <h4 className="text-lg font-semibold mb-3">
                        Opening Round Game {idx + 1}
                      </h4>

                      {/* TEAM 1 */}
                      <div className="mb-3">
                        <label className="block text-sm text-gray-300 mb-1">
                          Team 1
                        </label>
                        <select
                          className="w-full p-2 rounded-lg bg-slate-700 border border-slate-500 text-sm"
                          value={game.team1_id ?? ''}
                          onChange={(e) => {
                            const updated = [...openingGames];
                            updated[idx] = {
                              ...game,
                              team1_id: e.target.value ? Number(e.target.value) : null,
                            };
                            setOpeningGames(updated);
                          }}
                        >
                          <option value="">Select team...</option>
                          {openingTeams.map((t) => (
                            <option key={t.baseTeamId} value={t.baseTeamId}>
                              {t.team_name} — Seed {t.seed} ({t.region})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* TEAM 2 */}
                      <div className="mb-3">
                        <label className="block text-sm text-gray-300 mb-1">
                          Team 2
                        </label>
                        <select
                          className="w-full p-2 rounded-lg bg-slate-700 border border-slate-500 text-sm"
                          value={game.team2_id ?? ''}
                          onChange={(e) => {
                            const updated = [...openingGames];
                            updated[idx] = {
                              ...game,
                              team2_id: e.target.value ? Number(e.target.value) : null,
                            };
                            setOpeningGames(updated);
                          }}
                        >
                          <option value="">Select team...</option>
                          {openingTeams.map((t) => (
                            <option key={t.baseTeamId} value={t.baseTeamId}>
                              {t.team_name} — Seed {t.seed} ({t.region})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* WINNER ADVANCES TO */}
                      <div className="mb-3">
                        <label className="block text-sm text-gray-300 mb-1">
                          Winner advances to Round of 64 Game #
                        </label>
                        <input
                          type="number"
                          className="w-full p-2 rounded-lg bg-slate-700 border border-slate-500 text-sm"
                          placeholder="Enter Round of 64 game number (1–32)"
                          value={game.winner_to_game_number ?? ''}
                          onChange={(e) => {
                            const updated = [...openingGames];
                            updated[idx] = {
                              ...game,
                              winner_to_game_number: e.target.value
                                ? Number(e.target.value)
                                : null,
                            };
                            setOpeningGames(updated);
                          }}
                        />
                      </div>*/
                    </div>
                  ))}
                </div>

                <button
                  onClick={saveOpeningRound}
                  disabled={loading}
                  className="mt-6 px-6 py-3 bg-yellow-500 text-black rounded-lg disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Opening Round Games'}
                </button>
              </div>
            )}

            {step === 'round64' && (
              <div>
                <h3 className="text-xl font-bold mb-4">Round of 64 — 32 Games</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Assign seeds 1–16 and winners from opening round to 32 Round of 64 games.
                </p>

                <div className="space-y-6 max-h-[500px] overflow-y-auto">
                  {round64Games.map((game, idx) => (
                    <div
                      key={game.game_number}
                      className="bg-slate-900 border border-slate-700 rounded-lg p-4"
                    >
                      <h4 className="text-lg font-semibold mb-3">
                        Game {game.game_number} — {game.region}
                      </h4>

                      {/* TEAM 1 SOURCE */}
                      <div className="mb-3">
                        <label className="block text-sm text-gray-300 mb-1">
                          Team 1 Source
                        </label>
                        <select
                          className="w-full p-2 rounded-lg bg-slate-700 border border-slate-500 text-sm mb-2"
                          value={game.team1_source.type}
                          onChange={(e) => {
                            const updated = [...round64Games];
                            updated[idx] = {
                              ...game,
                              team1_source: {
                                type: e.target.value as 'team' | 'opening_winner',
                                value: null,
                              },
                            };
                            setRound64Games(updated);
                          }}
                        >
                          <option value="team">Direct Team (seed 1–16)</option>
                          <option value="opening_winner">Winner of Opening Round Game</option>
                        </select>

                        {game.team1_source.type === 'team' ? (
                          <select
                            className="w-full p-2 rounded-lg bg-slate-700 border border-slate-500 text-sm"
                            value={game.team1_source.value ?? ''}
                            onChange={(e) => {
                              const updated = [...round64Games];
                              updated[idx] = {
                                ...game,
                                team1_source: {
                                  type: 'team',
                                  value: e.target.value ? Number(e.target.value) : null,
                                },
                              };
                              setRound64Games(updated);
                            }}
                          >
                            <option value="">Select team...</option>
                            {round64Teams.map((t) => (
                              <option key={t.baseTeamId} value={t.baseTeamId}>
                                {t.team_name} — Seed {t.seed} ({t.region})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <select
                            className="w-full p-2 rounded-lg bg-slate-700 border border-slate-500 text-sm"
                            value={game.team1_source.value ?? ''}
                            onChange={(e) => {
                              const updated = [...round64Games];
                              updated[idx] = {
                                ...game,
                                team1_source: {
                                  type: 'opening_winner',
                                  value: e.target.value ? Number(e.target.value) : null,
                                },
                              };
                              setRound64Games(updated);
                            }}
                          >
                            <option value="">Select opening round game...</option>
                            {openingGames.map((_, gIdx) => (
                              <option key={gIdx + 1} value={gIdx + 1}>
                                Winner of Opening Round Game {gIdx + 1}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      {/* TEAM 2 SOURCE */}
                      <div className="mb-3">
                        <label className="block text-sm text-gray-300 mb-1">
                          Team 2 Source
                        </label>
                        <select
                          className="w-full p-2 rounded-lg bg-slate-700 border border-slate-500 text-sm mb-2"
                          value={game.team2_source.type}
                          onChange={(e) => {
                            const updated = [...round64Games];
                            updated[idx] = {
                              ...game,
                              team2_source: {
                                type: e.target.value as 'team' | 'opening_winner',
                                value: null,
                              },
                            };
                            setRound64Games(updated);
                          }}
                        >
                          <option value="team">Direct Team (seed 1–16)</option>
                          <option value="opening_winner">Winner of Opening Round Game</option>
                        </select>

                        {game.team2_source.type === 'team' ? (
                          <select
                            className="w-full p-2 rounded-lg bg-slate-700 border border-slate-500 text-sm"
                            value={game.team2_source.value ?? ''}
                            onChange={(e) => {
                              const updated = [...round64Games];
                              updated[idx] = {
                                ...game,
                                team2_source: {
                                  type: 'team',
                                  value: e.target.value ? Number(e.target.value) : null,
                                },
                              };
                              setRound64Games(updated);
                            }}
                          >
                            <option value="">Select team...</option>
                            {round64Teams.map((t) => (
                              <option key={t.baseTeamId} value={t.baseTeamId}>
                                {t.team_name} — Seed {t.seed} ({t.region})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <select
                            className="w-full p-2 rounded-lg bg-slate-700 border border-slate-500 text-sm"
                            value={game.team2_source.value ?? ''}
                            onChange={(e) => {
                              const updated = [...round64Games];
                              updated[idx] = {
                                ...game,
                                team2_source: {
                                  type: 'opening_winner',
                                  value: e.target.value ? Number(e.target.value) : null,
                                },
                              };
                              setRound64Games(updated);
                            }}
                          >
                            <option value="">Select opening round game...</option>
                            {openingGames.map((_, gIdx) => (
                              <option key={gIdx + 1} value={gIdx + 1}>
                                Winner of Opening Round Game {gIdx + 1}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={saveRound64}
                  disabled={loading}
                  className="mt-6 px-6 py-3 bg-yellow-500 text-black rounded-lg disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Round of 64 Games'}
                </button>
              </div>
            )}

            {step === 'autoGenerate' && (
              <div>
                <h3 className="text-xl font-bold mb-4">Auto‑Generate Full Tournament</h3>
                <p className="text-sm text-gray-400 mb-4">
                  This will generate Round of 32, Sweet 16, Elite 8, Final Four, and the
                  Championship based on your Opening Round and Round of 64 configuration.
                </p>

                <button
                  onClick={autoGenerateTournament}
                  disabled={loading}
                  className="mt-2 px-6 py-3 bg-yellow-500 text-black rounded-lg disabled:opacity-50"
                >
                  {loading ? 'Generating...' : 'Generate Full Tournament'}
                </button>
              </div>
            )}

            {step === 'validate' && (
              <div>
                <h3 className="text-xl font-bold mb-4">Validate Tournament Structure</h3>
                <p className="text-sm text-gray-400 mb-4">
                  This checks all rounds, seeds, regions, game counts, and bracket wiring.
                </p>

                <button
                  onClick={runValidation}
                  className="px-6 py-3 bg-yellow-500 text-black rounded-lg"
                  disabled={validating}
                >
                  {validating ? 'Validating...' : 'Run Validation'}
                </button>

                {validationResult && (
                  <div className="mt-6">
                    <h4
                      className={`text-lg font-semibold ${
                        validationResult.ok ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {validationResult.ok
                        ? 'Tournament is valid'
                        : 'Tournament has issues'}
                    </h4>

                    {validationResult.errors?.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-red-400 font-bold mb-2">Errors</h5>
                        <ul className="list-disc ml-6 text-sm text-red-300 space-y-1">
                          {validationResult.errors.map((err: string, idx: number) => (
                            <li key={idx}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {validationResult.warnings?.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-yellow-400 font-bold mb-2">Warnings</h5>
                        <ul className="list-disc ml-6 text-sm text-yellow-300 space-y-1">
                          {validationResult.warnings.map((warn: string, idx: number) => (
                            <li key={idx}>{warn}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {validationResult.summary && (
                      <p className="mt-4 text-sm text-gray-300">
                        {validationResult.summary}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {step === 'publish' && (
              <div>
                <h3 className="text-xl font-bold mb-4">Publish Tournament</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Publishing locks the tournament and enables bracket creation for all users.
                </p>

                <button
                  onClick={publishTournament}
                  disabled={loading}
                  className="px-6 py-3 bg-green-600 text-black rounded-lg disabled:opacity-50"
                >
                  {loading ? 'Publishing...' : 'Publish Tournament'}
                </button>

                {message && (
                  <pre className="mt-4 text-sm text-gray-300 bg-slate-800 p-4 rounded-lg whitespace-pre-wrap">
                    {message}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
