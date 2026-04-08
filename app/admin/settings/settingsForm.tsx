"use client";

import { useState, useTransition } from "react";
import { updateAdminCode } from "./settingsActions";

export default function AdminSettingsForm({ admins }) {
  const [codes, setCodes] = useState(
    Object.fromEntries(admins.map((a) => [a.email, a.admin_code || ""]))
  );

  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSave = (email) => {
    const newCode = codes[email];

    startTransition(async () => {
      const res = await updateAdminCode(email, newCode);

      if (res.status === "success") {
        setMessage(`Updated admin code for ${email}`);
      } else {
        setMessage(`Failed to update admin code for ${email}`);
      }
    });
  };

  return (
    <div className="space-y-6">
      {admins.map((admin) => (
        <div
          key={admin.email}
          className="bg-slate-800 p-4 rounded-lg border border-slate-700"
        >
          <p className="text-white font-semibold">{admin.email}</p>

          <input
            type="text"
            value={codes[admin.email]}
            onChange={(e) =>
              setCodes({ ...codes, [admin.email]: e.target.value })
            }
            className="mt-2 w-full px-3 py-2 rounded bg-slate-900 text-white border border-slate-600"
          />

          <button
            onClick={() => handleSave(admin.email)}
            disabled={isPending}
            className="mt-3 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded"
          >
            {isPending ? "Saving..." : "Save"}
          </button>
        </div>
      ))}

      {message && <p className="text-emerald-400">{message}</p>}
    </div>
  );
}
