"use client";

import { useTransition } from "react";
import { approveUser } from "./actions";

export default function ApproveButton({ email }: { email: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await approveUser(email);
          window.location.reload();
        })
      }
      className="bg-emerald-600 hover:bg-emerald-500 px-3 py-1 rounded-lg text-sm"
    >
      Approve
    </button>
  );
}
