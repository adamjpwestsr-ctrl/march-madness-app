import AdminDerbyEventForm from "@/app/admin/components/AdminDerbyEventForm";
import AdminDerbyPlayers from "@/app/admin/components/AdminDerbyPlayers";
import AdminDerbyResults from "@/app/admin/components/AdminDerbyResults";

export default function AdminDerbyPage() {
  return (
    <div className="p-6 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">MLB Home Run Derby – Admin</h1>
        <p className="text-slate-400 mt-1">
          Manage the yearly Derby event, participants, and results.
        </p>
      </div>

      {/* Event Setup */}
      <section className="bg-slate-900 border border-white/10 rounded-xl shadow-xl">
        <details open className="p-6">
          <summary className="cursor-pointer text-xl font-semibold text-white mb-4">
            Event Setup
          </summary>
          <AdminDerbyEventForm />
        </details>
      </section>

      {/* Players Section */}
      <section className="bg-slate-900 border border-white/10 rounded-xl shadow-xl">
        <details open className="p-6">
          <summary className="cursor-pointer text-xl font-semibold text-white mb-4">
            Participants (8 Players)
          </summary>
          <AdminDerbyPlayers />
        </details>
      </section>

      {/* Results Posting */}
      <section className="bg-slate-900 border border-white/10 rounded-xl shadow-xl">
        <details open className="p-6">
          <summary className="cursor-pointer text-xl font-semibold text-white mb-4">
            Results Posting
          </summary>
          <AdminDerbyResults />
        </details>
      </section>
    </div>
  );
}
