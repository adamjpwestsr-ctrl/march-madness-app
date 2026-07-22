import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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
);

export async function GET() {
  const { data, error } = await supabase
    .from("trivia_weekly")
    .select("*")
    .order("weekStart", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    return NextResponse.json({ error: "Weekly trivia not found" }, { status: 404 });
  }

  return NextResponse.json({
    weekInfo: { weekStart: data.weekStart },
    questions: data.questions || []
  });
}
