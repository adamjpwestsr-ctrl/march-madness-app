import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const cookieStore = cookies();

const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
      }
    }
  }
);
export async function GET() {
  try {
    const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
      }
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

    // Determine week start (Monday)
    const now = new Date();
    const day = now.getUTCDay(); // 0 = Sunday
    const diff = now.getUTCDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setUTCDate(diff));
    const weekStart = monday.toISOString().split("T")[0];

    // Fetch weekly questions
    const { data: questions, error: questionsError } = await supabase
      .from("trivia_weekly_questions")
      .select("id, question, choices, correctIndex, points")
      .eq("week_start", weekStart)
      .order("id", { ascending: true });

    if (questionsError) {
      console.error("Weekly trivia fetch error:", questionsError);
      return NextResponse.json(
        { error: "Failed to load weekly questions." },
        { status: 500 }
      );
    }

    // Fetch user for streak tracking
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    let streak = 0;

    if (!userError && user) {
      const { data: rounds, error: roundsError } = await supabase
        .from("trivia_rounds")
        .select("created_at")
        .eq("user_id", user.id)
        .eq("mode", "weekly")
        .order("created_at", { ascending: false });

      if (!roundsError && rounds.length > 0) {
        const lastRoundDate = rounds[0].created_at.split("T")[0];
        if (lastRoundDate === weekStart) {
          streak = rounds.length;
        }
      }
    }

    return NextResponse.json(
      {
        weekStart,
        streak,
        questions: questions || [],
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Weekly trivia API error:", err);
    return NextResponse.json(
      { error: "Server error." },
      { status: 500 }
    );
  }
}





