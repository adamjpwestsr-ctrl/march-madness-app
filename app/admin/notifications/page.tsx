"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { FaPhone } from "react-icons/fa";

export default function NotificationsAdminPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("all");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function sendNotification() {
    setSending(true);
    setResult(null);

    try {
      const res = await fetch("/api/admin/notifications/send", {
        method: "POST",
        body: JSON.stringify({ message, target }),
      });

      const data = await res.json();

      if (data.success) {
        setResult(`Sent to ${data.count} recipients`);
      } else {
        setResult(data.message || "Failed to send notifications");
      }
    } catch (err) {
      console.error(err);
      setResult("Error sending notifications");
    }

    setSending(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-10">
      <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-700 rounded-xl p-8">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <FaPhone className="text-sky-400" />
          Push Notifications
        </h1>

        <p className="opacity-80 mb-6">
          Send SMS notifications to all users or a specific user.  
          This tool uses your server‑side Supabase route for secure delivery.
        </p>

        {/* Message Input */}
        <label className="block mb-2 font-semibold">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 mb-6"
          rows={4}
          placeholder="Enter your notification message..."
        />

        {/* Target Selector */}
        <label className="block mb-2 font-semibold">Target</label>
        <select
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 mb-6"
        >
          <option value="all">All Users</option>
          <option value="single">Single User (ID prompt below)</option>
        </select>

        {target === "single" && (
          <input
            type="text"
            placeholder="Enter User ID"
            onChange={(e) => setTarget(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 mb-6"
          />
        )}

        {/* Send Button */}
        <button
          onClick={sendNotification}
          disabled={sending || !message.trim()}
          className="w-full bg-sky-600 hover:bg-sky-500 transition text-white font-semibold py-3 rounded-lg disabled:opacity-50"
        >
          {sending ? "Sending..." : "Send Notification"}
        </button>

        {/* Result */}
        {result && (
          <p className="mt-6 text-center text-sky-400 font-semibold">
            {result}
          </p>
        )}
      </div>
    </div>
  );
}
