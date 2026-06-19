import OpeningRoundEditor from "./OpeningRoundEditor";
import RoundOf64Editor from "./RoundOf64Editor";
import GenerateRoundsButton from "./GenerateRoundsButton";
import LockAndPublish from "./LockAndPublish";
import { loadAllTeams } from "./actions";

export default async function TournamentSetupPage() {
  const allTeams = await loadAllTeams(); // full objects: id, name, logo, conference

  return (
    <div style={{ padding: 30, background: "#0f172a", minHeight: "100vh" }}>
      <h1 style={{ textAlign: "center", marginBottom: 20 }}>
        Tournament Builder
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 30,
        }}
      >
        <OpeningRoundEditor allTeams={allTeams} />
        <RoundOf64Editor allTeams={allTeams} />
      </div>

      <div style={{ marginTop: 40, textAlign: "center" }}>
        <GenerateRoundsButton />
      </div>

      <LockAndPublish />
    </div>
  );
}

