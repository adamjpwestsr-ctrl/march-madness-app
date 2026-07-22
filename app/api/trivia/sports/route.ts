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

export async function GET() {
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
  );) {
  const { data } = await supabase.from("trivia_sports").select("*");
  return NextResponse.json({ sports: data || [] });
}

