
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleActive, togglePaid } from "./actions";

interface UserRowProps {
  user: {
    user_id: number;
    name: string | null;
    email: string | null;
    is_admin: boolean | null;
    is_active: boolean | null;
    has_paid: boolean | null;
  };
  bracketCount: number;
  mulliganCount: number;
  isExpanded: boolean;
  onToggleDetails: () => void;
}

export default function UserRow({
  user,
  bracketCount,
  mulliganCount,
  isExpanded,
  onToggleDetails,
}: UserRowProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onToggleActive = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("userId", String(user.user_id));
      await toggleActive(formData);
      router.refresh();
    });
  };

  const onTogglePaid = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("userId", String(user.user_id));
      await togglePaid(formData);
      router.refresh();
    });
  };

  return (
    <tr
      className={`border-b border-slate-800 transition hover:bg-slate-800/40 ${
        isPending ? "opacity-50" : ""
      }`}
    >
      <td className="px-5 py-4">
        <span className="block font-semibold text-white">
          {user.name?.trim() || "Unnamed User"}
        </span>

        <span
          className={`mt-1 inline-block text-[10px] font-bold uppercase tracking-wider ${
            user.is_admin ? "text-purple-400" : "text-slate-500"
          }`}
        >
          {user.is_admin ? "Administrator" : "Participant"}
        </span>
      </td>

      <td className="px-5 py-4 font-mono text-xs text-slate-500">
        {user.user_id}
      </td>

      <td className="px-5 py-4 text-sm text-slate-300">
        {user.email || "No email address"}
      </td>

      <td className="px-5 py-4">
        <button
          type="button"
          onClick={onToggleActive}
          disabled={isPending}
          className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
            user.is_active
              ? "bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30"
              : "bg-slate-700 text-slate-300 hover:bg-slate-600"
          } disabled:cursor-not-allowed`}
        >
          {user.is_active ? "Active" : "Inactive"}
        </button>
      </td>

      <td className="px-5 py-4">
        <button
          type="button"
          onClick={onTogglePaid}
          disabled={isPending}
          className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
            user.has_paid
              ? "bg-blue-600/20 text-blue-400 hover:bg-blue-600/30"
              : "bg-amber-600/20 text-amber-400 hover:bg-amber-600/30"
          } disabled:cursor-not-allowed`}
        >
          {user.has_paid ? "Paid" : "Unpaid"}
        </button>
      </td>

      <td className="px-5 py-4">
        <button
          type="button"
          onClick={onToggleDetails}
          className="whitespace-nowrap rounded-md border border-slate-700 px-3 py-1.5 text-xs font-semibold text-cyan-300 transition hover:border-cyan-700 hover:bg-cyan-950/40"
        >
          {isExpanded ? "Hide Details" : "View Details"}
        </button>

        <p className="mt-1 whitespace-nowrap text-[10px] text-slate-500">
          {bracketCount} brackets · {mulliganCount} mulligans
        </p>
      </td>
    </tr>
  );
}
