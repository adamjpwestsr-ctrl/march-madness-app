export const runtime = "edge";
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import FantasyDraftRoom from "./FantasyDraftRoom";

export default async function DraftLivePage() {
  // Read mm_session (async in your environment)
  const store = await cookies();
  const raw = store.get("mm_session")?.value;

  if (!raw) {
    redirect("/login");
  }

  let session;
  try {
    session = JSON.parse(raw);
  } catch {
    redirect("/login");
  }

  if (!session.email || !session.userId) {
    redirect("/login");
  }

  // (Optional) if you ever add per‑league access rules, you can check them here.

  // Render your existing client draft room
  return <FantasyDraftRoom />;
}
