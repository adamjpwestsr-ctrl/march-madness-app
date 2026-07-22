import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import {
  cookies: {
    get(name: string) {
      return cookieStore.get(name)?.value;
    },
    set(name: string, value: string, options: any) {
      cookieStore.set(name, value, options);
    },
    remove(name: string, options: any) {
      cookieStore.set(name, '', { ...options, maxAge: 0 });
    },
  }
} from 'next/headers';
const cookieStore = cookies();

export async function GET(req: Request) {
  try {
    const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        cookieStore.set(name, value, options);
      },
      remove(name: string, options: any) {
        cookieStore.set(name, '', { ...options, maxAge: 0 });
      },
    }
  }
) {
      return cookieStore.get(name)?.value;
    },
    set(name: string, value: string, options: any) {
      cookieStore.set(name, value, options);
    },
    remove(name: string, options: any) {
      cookieStore.set(name, '', { ...options, maxAge: 0 });
    },
  }
}
);

    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode") || "daily"; // daily | weekly | alltime

    let query = supabase
      .from("trivia_rounds")
      .select("id, user_id, score, mode, created_at, streak")
      .order("score", { ascending: false })
      .limit(50);

    // Filter by mode
    if (mode === "daily") {
      query = query.eq("mode", "daily");
    } else if (mode === "weekly") {
      query = query.eq("mode", "weekly");
    } else if (mode === "alltime") {
      // no filter — return everything
    }

    const { data: rounds, error: roundsError } = await query;

    if (roundsError) {
      console.error("Leaderboard fetch error:", roundsError);
      return NextResponse.json(
        { error: "Failed to load leaderboard." },
        { status: 500 }
      );
    }

    // Fetch user names
    const userIds = rounds.map((r) => r.user_id);

    const { data: users, error: usersError } = await supabase
      .from("profiles")
      .select("id, username")
      .in("id", userIds);

    if (usersError) {
      console.error("User fetch error:", usersError);
      return NextResponse.json(
        { error: "Failed to load user profiles." },
        { status: 500 }
      );
    }

    // Map user names into leaderboard entries
    const scores = rounds.map((r) => {
      const user = users.find((u) => u.id === r.user_id);
      return {
        id: r.id,
        player: user?.username || "Unknown Player",
        score: r.score,
        streak: r.streak,
        created_at: r.created_at,
      };
    });

    return NextResponse.json({ scores }, { status: 200 });
  } catch (err) {
    console.error("Leaderboard API error:", err);
    return NextResponse.json(
      { error: "Server error." },
      { status: 500 }
    );
  }
}



