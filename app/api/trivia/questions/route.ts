import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const cookieStore = cookies();

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
        cookieStore.set(name, "", { ...options, maxAge: 0 });
      }
    }
  }
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sport = searchParams.get("sport");

  const { data, error } = await supabase
    .from("trivia_questions")
    .select("*")
    .eq("sport", sport);

  return NextResponse.json({ questions: data || [] });
}

export async function POST(req: Request) {
  const body = await req.json();

  const { error } = await supabase.from("trivia_questions").insert({
    sport: body.sport,
    question: body.question,
    answer: body.answer,
    difficulty: body.difficulty,
    points: body.points
  });

  if (error) {
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }

  return NextResponse.json({ message: "Inserted" });
}
