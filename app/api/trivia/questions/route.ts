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

/* -------------------- GET: Fetch questions by sport -------------------- */
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
    const sport = searchParams.get("sport");

    if (!sport) {
      return NextResponse.json(
        { error: "Sport is required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("trivia_questions")
      .select("id, sport, question, answer, difficulty, points")
      .eq("sport", sport)
      .order("id", { ascending: true });

    if (error) {
      console.error("Fetch questions error:", error);
      return NextResponse.json(
        { error: "Failed to load questions." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { questions: data || [] },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /questions error:", err);
    return NextResponse.json(
      { error: "Server error." },
      { status: 500 }
    );
  }
}

/* -------------------- POST: Add new question -------------------- */
export async function POST(req: Request) {
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

    const body = await req.json();
    const { sport, question, answer, difficulty, points } = body;

    if (!sport || !question || !answer || !difficulty || !points) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("trivia_questions")
      .insert({
        sport,
        question,
        answer,
        difficulty,
        points,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error("Insert question error:", error);
      return NextResponse.json(
        { error: "Failed to add question." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Question added successfully." },
      { status: 200 }
    );
  } catch (err) {
    console.error("POST /questions error:", err);
    return NextResponse.json(
      { error: "Server error." },
      { status: 500 }
    );
  }
}



