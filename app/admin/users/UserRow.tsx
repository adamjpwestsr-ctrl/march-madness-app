"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleActive, togglePaid } from "./actions";

export default function UserRow({ user }) {
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
    <tr className="border-b border-slate-800 hover:bg-slate-800/40 transition">
      <td className="py-3">{user.email}</td>

      {/* ACTIVE */}
      <td className="py-3">
        <button
          onClick={onToggleActive}
          disabled={isPending}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all
            ${
              user.is_active
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-700/30 hover:bg-emerald-500"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }
            ${isPending ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          {user.is_active ? "Active" : "Inactive"}
        </button>
      </td>

      {/* PAID */}
      <td className="py-3">
        <button
          onClick={onTogglePaid}
          disabled={isPending}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all
            ${
              user.has_paid
                ? "bg-blue-600 text-white shadow-md shadow-blue-700/30 hover:bg-blue-500"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }
            ${isPending ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          {user.has_paid ? "Paid" : "Unpaid"}
        </button>
      </td>
    </tr>
  );
}
