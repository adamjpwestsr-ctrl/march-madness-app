"use client";

import { useState, useEffect } from "react";

type AdminUser = {
  user_id: number;
  username: string;
  phone_number: string | null;
};

export default function AdminNotificationsPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState("all");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [result, setResult] = useState("");

  // Scheduling fields
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  // Load users on mount
  useEffect(() => {
    async function loadUsers() {
      const res = await fetch("/api/admin/notifications/users");
      const data = await res.json();
      setUsers(data.users);
    }
    loadUsers();
  }, []);

  // Send Now
  async function sendNotification() {
    if (!message.trim()) {
      setResult("Message cannot be empty.");
      return;
    }

    setSending(true);
    setResult("");

    const res = await fetch("/api/admin/notifications/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: selectedUser,
        message,
      }),
    });

    const data = await res.json();
    setSending(false);

    if (data.error) {
      setResult("Error: " + data.error);
    } else {
      setResult("Notification sent successfully.");
      setMessage("");
    }
  }

  // Schedule Notification
  async function scheduleNotification() {
    if (!scheduleDate || !scheduleTime) {
      setResult("Please select a date and time.");
      return;
    }

    if (!message.trim()) {
      setResult("Message cannot be empty.");
      return;
    }

    setScheduling(true);
    setResult("");

    const scheduled_for = new Date(`${scheduleDate}T${scheduleTime}:00`);

    const res = await fetch("/api/admin/notifications/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: selectedUser,
        message,
        scheduled_for,
      }),
    });

    const data = await res.json();
    setScheduling(false);

    if (data.error) {
      setResult("Error: " + data.error);
    } else {
      setResult("Notification scheduled successfully.");
      setMessage("");
      setScheduleDate("");
      setScheduleTime("");
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-semibold">Push Notifications</h1>
      <p className="text-slate-400">
        Send real-time or scheduled notifications to users.
      </p>

      {/* Recipient Selector */}
      <div>
        <p className="text-sm text-slate-400 mb-1">Send To</p>
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All Users</option>
          {users.map((u) => (
            <option key={u.user_id} value={u.user_id}>
              {u.username} ({u.phone_number || "No phone"})
            </option>
          ))}
        </select>
      </div>

      {/* Message Box */}
      <div>
        <p className="text-sm text-slate-400 mb-1">Message</p>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm w-full h-32"
          placeholder="Type your notification..."
        />
      </div>

      {/* Send Now */}
      <button
        onClick={sendNotification}
        disabled={sending}
        className="bg-emerald-600 hover:bg-emerald-700 px-6 py-2 rounded-lg text-white"
      >
        {sending ? "Sending..." : "Send Now"}
      </button>

      {/* Scheduling Section */}
      <div className="border-t border-slate-800 pt-6 mt-6">
        <h2 className="text-xl font-semibold mb-3">Schedule Notification</h2>

        <div className="flex gap-4 mb-4">
          <div>
            <p className="text-sm text-slate-400 mb-1">Date</p>
            <input
              type="date"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <p className="text-sm text-slate-400 mb-1">Time</p>
            <input
              type="time"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        <button
          onClick={scheduleNotification}
          disabled={scheduling}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg text-white"
        >
          {scheduling ? "Scheduling..." : "Schedule Notification"}
        </button>
      </div>

      {result && <p className="text-slate-300">{result}</p>}
    </div>
  );
}
