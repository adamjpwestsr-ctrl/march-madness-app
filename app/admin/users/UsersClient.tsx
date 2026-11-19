
"use client";

import { Fragment, useMemo, useState } from "react";
import UserRow from "./UserRow";

type User = {
  user_id: number;
  name: string | null;
  email: string | null;
  is_admin: boolean | null;
  is_active: boolean | null;
  has_paid: boolean | null;
};

type Bracket = {
  bracket_id: string;
  user_id: number;
  bracket_name: string;
  created_at: string | null;
};

type MulliganRequest = {
  id: number;
  user_id: number;
  bracket_id: string | null;
  game_id: number;
  replacement_team: string;
  status: string;
  created_at: string;
};

type ActiveFilter = "all" | "active" | "inactive";
type PaidFilter = "all" | "paid" | "unpaid";

interface UsersClientProps {
  users: User[];
  brackets: Bracket[];
  mulligans: MulliganRequest[];
}

function getValidEmails(users: User[]) {
  const emails = users
    .map((user) => user.email?.trim().toLowerCase() ?? "")
    .filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));

  return [...new Set(emails)];
}

export default function UsersClient({
  users,
  brackets,
  mulligans,
}: UsersClientProps) {
  const [activeFilter, setActiveFilter] =
    useState<ActiveFilter>("all");

  const [paidFilter, setPaidFilter] =
    useState<PaidFilter>("all");

  const [search, setSearch] = useState("");
  const [expandedUser, setExpandedUser] = useState<number | null>(null);
  const [copyMessage, setCopyMessage] = useState("");

  const activeCount = users.filter((u) => u.is_active).length;
  const inactiveCount = users.length - activeCount;
  const paidCount = users.filter((u) => u.has_paid).length;
  const unpaidCount = users.length - paidCount;
  const adminCount = users.filter((u) => u.is_admin).length;

  const bracketsByUser = useMemo(() => {
    const result: Record<number, Bracket[]> = {};

    brackets.forEach((bracket) => {
      if (!result[bracket.user_id]) result[bracket.user_id] = [];
      result[bracket.user_id].push(bracket);
    });

    return result;
  }, [brackets]);

  const mulligansByUser = useMemo(() => {
    const result: Record<number, MulliganRequest[]> = {};

    mulligans.forEach((request) => {
      if (!result[request.user_id]) result[request.user_id] = [];
      result[request.user_id].push(request);
    });

    return result;
  }, [mulligans]);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return users.filter((user) => {
      if (activeFilter === "active" && !user.is_active) return false;
      if (activeFilter === "inactive" && user.is_active) return false;

      if (paidFilter === "paid" && !user.has_paid) return false;
      if (paidFilter === "unpaid" && user.has_paid) return false;

      if (term) {
        const matches =
          String(user.user_id).includes(term) ||
          (user.name ?? "").toLowerCase().includes(term) ||
          (user.email ?? "").toLowerCase().includes(term);

        if (!matches) return false;
      }

      return true;
    });
  }, [users, activeFilter, paidFilter, search]);

  const allEmails = useMemo(() => getValidEmails(users), [users]);

  const filteredEmails = useMemo(
    () => getValidEmails(filteredUsers),
    [filteredUsers]
  );

  const openGmail = (emails: string[]) => {
    if (emails.length === 0) {
      alert("There are no valid email addresses in this selection.");
      return;
    }

    const subject = "Message from BracketBoss";

    const gmailUrl =
      "https://mail.google.com/mail/?view=cm&fs=1" +
      `&bcc=${encodeURIComponent(emails.join(","))}` +
      `&su=${encodeURIComponent(subject)}`;

    window.open(gmailUrl, "_blank", "noopener,noreferrer");
  };

  const copyEmails = async (emails: string[]) => {
    if (emails.length === 0) {
      setCopyMessage("No valid email addresses to copy.");
      return;
    }

    try {
      await navigator.clipboard.writeText(emails.join("; "));
      setCopyMessage(`${emails.length} email addresses copied.`);
    } catch {
      setCopyMessage("Unable to copy email addresses.");
    }
  };

  const resetFilters = () => {
    setActiveFilter("all");
    setPaidFilter("all");
    setSearch("");
  };

  const toggleExpand = (userId: number) => {
    setExpandedUser((current) =>
      current === userId ? null : userId
    );
  };

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      {/* HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">
            BracketBoss Administration
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
            User Management
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Manage accounts, payments, brackets, and user communications.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 px-5 py-3">
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Registered Users
          </p>
          <p className="text-3xl font-black text-white">{users.length}</p>
        </div>
      </div>

      {/* STATISTICS */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <SummaryCard
          label="Total Users"
          value={users.length}
          color="cyan"
        />
        <SummaryCard
          label="Active"
          value={activeCount}
          color="emerald"
        />
        <SummaryCard
          label="Inactive"
          value={inactiveCount}
          color="slate"
        />
        <SummaryCard
          label="Paid"
          value={paidCount}
          color="blue"
        />
        <SummaryCard
          label="Unpaid"
          value={unpaidCount}
          color="amber"
        />
      </div>

      {/* EMAIL USERS */}
      <section className="rounded-2xl border border-cyan-900/60 bg-slate-900 p-5 shadow-xl sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
              </div>

              <h2 className="text-lg font-bold text-white">
                Email Users
              </h2>
            </div>

            <p className="mt-2 max-w-xl text-sm text-slate-400">
              Open a Gmail draft with recipients automatically placed in BCC.
              Review your message and send it when ready.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => openGmail(allEmails)}
              disabled={allEmails.length === 0}
              className="rounded-lg bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Email All Users ({allEmails.length})
            </button>

            <button
              type="button"
              onClick={() => openGmail(filteredEmails)}
              disabled={filteredEmails.length === 0}
              className="rounded-lg border border-cyan-700 bg-cyan-950/40 px-5 py-3 text-sm font-bold text-cyan-200 transition hover:bg-cyan-900/60 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Email Filtered ({filteredEmails.length})
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-slate-800 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            All recipients are placed in BCC. Duplicate and invalid addresses
            are excluded.
          </p>

          <button
            type="button"
            onClick={() => copyEmails(filteredEmails)}
            disabled={filteredEmails.length === 0}
            className="self-start rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 sm:self-auto"
          >
            Copy Filtered Emails
          </button>
        </div>

        {copyMessage && (
          <p role="status" className="mt-3 text-sm font-medium text-cyan-300">
            {copyMessage}
          </p>
        )}
      </section>

      {/* SEARCH AND FILTERS */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Find Users</h2>
            <p className="text-xs text-slate-500">
              Search and filters also determine the Email Filtered recipients.
            </p>
          </div>

          <button
            type="button"
            onClick={resetFilters}
            className="self-start text-xs font-semibold text-cyan-400 hover:text-cyan-300"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <label
              htmlFor="user-search"
              className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400"
            >
              Search
            </label>

            <input
              id="user-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name, email, or user ID..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500"
            />
          </div>

          <FilterSelect
            label="Account Status"
            value={activeFilter}
            onChange={(value) => setActiveFilter(value as ActiveFilter)}
            options={[
              { value: "all", label: "All Accounts" },
              { value: "active", label: "Active Only" },
              { value: "inactive", label: "Inactive Only" },
            ]}
          />

          <FilterSelect
            label="Payment Status"
            value={paidFilter}
            onChange={(value) => setPaidFilter(value as PaidFilter)}
            options={[
              { value: "all", label: "All Payments" },
              { value: "paid", label: "Paid Only" },
              { value: "unpaid", label: "Unpaid Only" },
            ]}
          />
        </div>
      </section>

      {/* USER LIST */}
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        <div className="flex flex-col gap-2 border-b border-slate-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">System Users</h2>
            <p className="text-xs text-slate-500">
              Showing {filteredUsers.length} of {users.length} users
            </p>
          </div>

          <p className="text-xs text-slate-500">
            {adminCount} administrator account{adminCount === 1 ? "" : "s"}
          </p>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <p className="font-semibold text-slate-300">No users found</p>
            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left">
              <thead className="border-b border-slate-800 bg-slate-950/60 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-4">User</th>
                  <th className="px-5 py-4">User ID</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Account</th>
                  <th className="px-5 py-4">Payment</th>
                  <th className="px-5 py-4">Details</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => {
                  const userBrackets = bracketsByUser[user.user_id] ?? [];
                  const userMulligans = mulligansByUser[user.user_id] ?? [];
                  const isExpanded = expandedUser === user.user_id;

                  return (
                    <Fragment key={user.user_id}>
<UserRow
  user={user}
  bracketCount={userBrackets.length}
  mulliganCount={userMulligans.length}
  isExpanded={isExpanded}
  onToggleDetails={() => toggleExpand(user.user_id)}
/>

                      {isExpanded && (
                        <tr className="border-b border-slate-700 bg-slate-950/60">
                          <td colSpan={6} className="p-5">
                            <div className="grid gap-6 lg:grid-cols-2">
                              {/* BRACKETS */}
                              <div>
                                <div className="mb-3 flex items-center justify-between">
                                  <h3 className="font-bold text-white">
                                    Brackets ({userBrackets.length})
                                  </h3>

                                  <a
                                    href="/admin/brackets"
                                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                                  >
                                    Manage Brackets ↗
                                  </a>
                                </div>

                                {userBrackets.length === 0 ? (
                                  <p className="text-sm text-slate-500">
                                    No brackets found.
                                  </p>
                                ) : (
                                  <div className="space-y-2">
                                    {userBrackets.map((bracket) => (
                                      <div
                                        key={bracket.bracket_id}
                                        className="rounded-lg border border-slate-800 bg-slate-900 p-3"
                                      >
                                        <p className="text-sm font-semibold text-white">
                                          {bracket.bracket_name}
                                        </p>

                                        <p className="mt-1 break-all font-mono text-xs text-slate-500">
                                          {bracket.bracket_id}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                          Created:{" "}
                                          {bracket.created_at
                                            ? new Date(
                                                bracket.created_at
                                              ).toLocaleString()
                                            : "Unknown"}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* MULLIGANS */}
                              <div>
                                <div className="mb-3 flex items-center justify-between">
                                  <h3 className="font-bold text-white">
                                    Mulligan Requests ({userMulligans.length})
                                  </h3>

                                  <a
                                    href="/admin/mulligans"
                                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                                  >
                                    Manage Mulligans ↗
                                  </a>
                                </div>

                                {userMulligans.length === 0 ? (
                                  <p className="text-sm text-slate-500">
                                    No mulligan requests found.
                                  </p>
                                ) : (
                                  <div className="space-y-2">
                                    {userMulligans.map((request) => (
                                      <div
                                        key={request.id}
                                        className="rounded-lg border border-slate-800 bg-slate-900 p-3"
                                      >
                                        <p className="text-sm text-white">
                                          Game {request.game_id}:{" "}
                                          <strong>
                                            {request.replacement_team}
                                          </strong>
                                        </p>

                                        <p className="mt-1 text-xs text-slate-400">
                                          Status:{" "}
                                          {request.status.toUpperCase()}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                          {new Date(
                                            request.created_at
                                          ).toLocaleString()}
                                        </p>

                                        {request.bracket_id && (
                                          <p className="mt-1 break-all font-mono text-xs text-slate-600">
                                            Bracket: {request.bracket_id}
                                          </p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="text-center text-xs text-slate-600">
        BracketBoss User Management
      </p>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "cyan" | "emerald" | "slate" | "blue" | "amber";
}) {
  const colors = {
    cyan: "text-cyan-400",
    emerald: "text-emerald-400",
    slate: "text-slate-300",
    blue: "text-blue-400",
    amber: "text-amber-400",
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
      <p className="text-xs font-semibold text-slate-400">{label}</p>
      <p className={`mt-2 text-3xl font-black ${colors[color]}`}>
        {value}
      </p>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
