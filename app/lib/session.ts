import { cookies } from "next/headers";

type SessionResult = {
  userId: string;
  email: string;
  isAdmin: boolean;
} | null;

export function getSession(): SessionResult {
  const cookieStore = cookies(); // sync

  const raw = cookieStore.get("mm_session")?.value;
  if (!raw) return null;

  try {
    const session = JSON.parse(raw);
    return {
      userId: session.userId,
      email: session.email,
      isAdmin: session.isAdmin
    };
  } catch {
    return null;
  }
}
