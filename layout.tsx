// app/layout.tsx
import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Bracket Boss | Play. Predict. Win.",
  description: "Play brackets, weekly picks, and trivia across your favorite sports—all in one place.",
};


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="bg-slate-950">
      <body className="bg-slate-950 text-slate-50 antialiased">
        {children}
      </body>
    </html>
  );
}
