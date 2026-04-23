"use client";

import PlayersPageClientInner from "./PlayersPageClientInner";
import { ToastProvider } from "./Toast";

interface PlayersPageClientProps {
  initialData: {
    users: { user_id: number; email: string }[];
    contests: { id: string; name: string; sport: string }[];
    statuses: {
      id: number;
      user_id: number;
      contest_id: string;
      is_active: boolean;
      has_paid: boolean;
      paid_at: string | null;
      email: string;
      contest_name: string;
      sport: string;
    }[];
  };
}

export default function PlayersPageClient({ initialData }: PlayersPageClientProps) {
  return (
    <ToastProvider>
      <PlayersPageClientInner initialData={initialData} />
    </ToastProvider>
  );
}

export default function PlayersPageClient({
  initialData,
}: PlayersPageClientProps) {
  return <PlayersPageClientInner initialData={initialData} />;
}
