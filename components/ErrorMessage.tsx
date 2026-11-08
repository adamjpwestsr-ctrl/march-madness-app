export function ErrorMessage({ message }: { message: string }) {
  if (!message) return null;

  return (
    <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm font-semibold">
      {message}
    </div>
  );
}
