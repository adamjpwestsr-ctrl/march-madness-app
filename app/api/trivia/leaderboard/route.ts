import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const cookieStore = cookies() as any;

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

export async function GET() {
  const { data } = await supabase.from("trivia_rounds").select("*");
  return NextResponse.json({ leaderboard: data || [] });
}

export async function DELETE() {
  await supabase.from("trivia_rounds").delete().neq("id", 0);
  return NextResponse.json({ message: "Leaderboard cleared" });
}
