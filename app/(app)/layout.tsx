
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const requestHeaders = await headers();

  // Allow the March Madness login route without requiring a session.
  const isMarchMadnessLogin =
    requestHeaders.get("x-public-route") === "march-madness-login";

  // Require a valid mm_session cookie on all other routes.
  if (!isMarchMadnessLogin) {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("mm_session");

    if (!sessionCookie) {
      redirect("/login");
    }

    try {
      JSON.parse(sessionCookie.value);
    } catch {
      redirect("/login");
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-slate-950 text-white overflow-hidden">
      <main className="flex-1 min-w-0 w-full overflow-y-auto p-4">
        {children}
      </main>
    </div>
  );
}
