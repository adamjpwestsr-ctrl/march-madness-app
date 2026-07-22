import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers',
    set(name: string, value: string, options: any) {
      cookieStore.set(name, value, options);
    },
    remove(name: string, options: any) {
      cookieStore.set(name, '', { ...options, maxAge: 0 });
    },
  }
} from 'next/headers';
const cookieStore = cookies();

/* -------------------- GET: Fetch all feedback -------------------- */
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

    const { data, error } = await supabase
      .from("trivia_feedback")
      .select(
        "id, email, type, body, enhancement_requested, enhancement_text, shout_out, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch feedback error:", error);
      return NextResponse.json(
        { error: "Failed to load feedback." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { feedback: data || [] },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /feedback error:", err);
    return NextResponse.json(
      { error: "Server error." },
      { status: 500 }
    );
  }
}

/* -------------------- POST: Submit new feedback -------------------- */
export async function POST(req: Request) {
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

    const body = await req.json();
    const {
      email,
      type,
      body: feedbackBody,
      enhancement_requested,
      enhancement_text,
      shout_out,
    } = body;

    if (!email || !type || !feedbackBody) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("trivia_feedback").insert({
      email,
      type,
      body: feedbackBody,
      enhancement_requested: !!enhancement_requested,
      enhancement_text: enhancement_requested ? enhancement_text || null : null,
      shout_out: !!shout_out,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Insert feedback error:", error);
      return NextResponse.json(
        { error: "Failed to submit feedback." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Feedback submitted successfully." },
      { status: 200 }
    );
  } catch (err) {
    console.error("POST /feedback error:", err);
    return NextResponse.json(
      { error: "Server error." },
      { status: 500 }
    );
  }
}




