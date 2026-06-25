'use client';

export default function AdminPage() {
  async function setup() {
    await fetch('/api/march-madness/admin/setup', { method: 'POST' });
    alert('Tournament setup complete!');
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold">Admin Panel</h1>

      <button
        onClick={setup}
        className="px-4 py-2 bg-red-600 text-white rounded-lg"
      >
        Run Tournament Setup
      </button>
    </div>
  );
}
