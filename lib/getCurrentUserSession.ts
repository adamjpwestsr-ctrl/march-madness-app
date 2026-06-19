import { cookies } from "next/headers";

export type MmSession = {
  userId: number;
  email: string;
  isAdmin: boolean;
};

export async function getCurrentUserSession(): Promise<MmSession | null> {
  // Next.js 16: cookies() returns a Promise
  const cookieStore = await cookies();
  const cookie = cookieStore.get("mm_session");

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

