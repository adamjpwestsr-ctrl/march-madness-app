import { cookies } from 'next/headers';

export function getSession() {
  const cookieStore = cookies();
  const raw = cookieStore.get('mm_session');

  if (!raw) return null;

  try {
    return JSON.parse(raw.value);
  } catch {
    return null;
  }
}
