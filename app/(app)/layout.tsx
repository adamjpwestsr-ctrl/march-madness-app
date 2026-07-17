export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
        {children}
      </main>
    </div>
  );
}
