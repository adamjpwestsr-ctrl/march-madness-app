const sports = [
  { name: "NBA", color: "from-orange-500 to-red-600" },
  { name: "NFL", color: "from-blue-600 to-blue-800" },
  { name: "MLB", color: "from-red-500 to-red-700" },
  { name: "NHL", color: "from-gray-500 to-gray-700" },
];

export default function FeaturedSports() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow">
      <h3 className="text-xl font-semibold mb-4">Featured Sports</h3>

      <div className="grid grid-cols-2 gap-4">
        {sports.map((sport) => (
          <div
            key={sport.name}
            className={`rounded-lg p-4 text-center font-semibold text-white bg-gradient-to-br ${sport.color} cursor-pointer hover:scale-[1.02] transition`}
          >
            {sport.name}
          </div>
        ))}
      </div>
    </div>
  );
}
