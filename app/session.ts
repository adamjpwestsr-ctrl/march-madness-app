import { cookies } from 'next/headers';

export async function getSession() {
  const cookieStore = await cookies(); // <-- must await in your environment
  const raw = cookieStore.get('mm_session');

  if (!raw) return null;

  try {
    return JSON.parse(raw.value);
  } catch {
    return null;
  }
}
