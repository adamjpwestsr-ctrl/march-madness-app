import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function getSession() {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        }
      }
    }
  );

  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) return null;

  return {
    userId: session.user.id,
    email: session.user.email
  };
}
