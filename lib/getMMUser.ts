import { cookies } from "next/headers";

export async function getMMUser() {
  const store = await cookies(); // resolves the Promise
  const raw = store.get("mm_session")?.value;
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
