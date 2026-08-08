"use client";

import { useEffect, useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import UserRow from "./UserRow";

export default function UsersAdminPage() {
  const supabase = createSupabaseBrowserClient();

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  // Load users
  useEffect(() => {
    async function loadUsers() {
      const { data, error } = await supabase
        .from("users")
        .select("user_id, email, is_active, has_paid")
        .order("email");

      if (!error && data) {
        setUsers(data);
      }

      setLoading(false);
    }

    loadUsers();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Admin: User List</h1>

      {message && (
        <p className="text-center text-emerald-400 font-semibold mb-6">
          {message}
        </p>
      )}

      {loading ? (
        <p className="text-center text-slate-400">Loading users...</p>
      ) : users.length === 0 ? (
        <p className="text-center text-slate-400">No users found.</p>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <table className="w-full text-left">
            <thead className="text-slate-400 border-b border-slate-700">
              <tr>
                <th className="py-2">Email</th>
                <th className="py-2">Active</th>
                <th className="py-2">Paid</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <UserRow key={u.user_id} user={u} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
