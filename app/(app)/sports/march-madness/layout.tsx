"use client";

export default function MarchMadnessLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Main content area only */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
