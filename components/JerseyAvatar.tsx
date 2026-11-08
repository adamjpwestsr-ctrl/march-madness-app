export default function JerseyAvatar({ color = "blue", number = "00", size = 64 }) {
  const colors: Record<string, string> = {
    blue: "#3B82F6",
    red: "#EF4444",
    green: "#10B981",
    yellow: "#FACC15",
    purple: "#8B5CF6",
    black: "#1F2937",
    white: "#F3F4F6"
  };

  const jerseyColor = colors[color] || colors.blue;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect
        x="20"
        y="10"
        width="60"
        height="80"
        rx="10"
        fill={jerseyColor}
        stroke="#000"
        strokeWidth="3"
      />
      <text
        x="50"
        y="60"
        textAnchor="middle"
        fontSize="32"
        fontWeight="bold"
        fill="#fff"
      >
        {number}
      </text>
    </svg>
  );
}
