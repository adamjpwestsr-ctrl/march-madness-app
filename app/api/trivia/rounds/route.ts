import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const cookieStore = cookies() as any;


      },
      remove(name: string, options: any) {
        cookieStore.set(name, "", { ...options, maxAge: 0 });
      }
    }
  }
);

export async function POST() {
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
          cookieStore.set(name, "", { ...options, maxAge: 0 });
        }
      }
    }
  );req: Request) {
  const body = await req.json();

  await supabase.from("trivia_rounds").insert({
    sport: body.sport,
    score: body.score,
    correct: body.correct,
    total: body.total
  });

  return NextResponse.json({ message: "Saved" });
}

