"use client";

import { useTransition } from "react";
import { denyUser } from "./actions";

export default function DenyButton({ email }: { email: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await denyUser(email);
          window.location.reload();
        })
      }
      className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded-lg text-sm"
    >
      Deny
    </button>
  );
}
