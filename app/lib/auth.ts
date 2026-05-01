import { cookies } from "next/headers";

export interface Session {
  user: {
    id: string;
    email: string;
    name: string;
    role: "user" | "admin";
  };
}

export function getSession(): Session | null {
  const raw = cookies().get("mm_session")?.value;
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}
