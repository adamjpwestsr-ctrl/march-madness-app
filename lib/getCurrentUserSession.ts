import { cookies } from "next/headers";

export type MmSession = {
  userId: number;
  email: string;
  isAdmin: boolean;
};

export function getCurrentUserSession(): MmSession | null {
  const cookie = cookies().get("mm_session");
  if (!cookie) return null;

  try {
    const parsed = JSON.parse(cookie.value);
    return {
      userId: parsed.userId,
      email: parsed.email,
      isAdmin: parsed.isAdmin ?? false,
    };
  } catch {
    return null;
  }
}
