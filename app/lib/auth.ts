import { cookies } from "next/headers";

export interface Session {
  user: {
    id: string;
    email: string;
    name: string;
    role: "user" | "admin";
  };
}

export async function getSession(): Promise<Session | null> {
  // Next.js 16: cookies() is async
  const cookieStore = await cookies();

  const raw = cookieStore.get("mm_session")?.value;
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}
