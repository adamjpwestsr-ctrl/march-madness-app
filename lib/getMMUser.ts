import { cookies } from "next/headers";

export function getMMUser() {
  const store = cookies();
  const raw = store.get("mm_session")?.value;
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
