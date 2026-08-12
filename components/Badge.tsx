export default function Badge({
  type,
  value,
}: {
  type: string;
  value: string;
}) {
  if (!value) return null;

  const colors: Record<string, string> = {
    Elite: "#00E5FF",
    Starter: "#4CAF50",
    Flex: "#FFC107",
    Depth: "#9E9E9E",

    Workhorse: "#FF9800",
    "Target Hog": "#00BCD4",
    "Red Zone Threat": "#F44336",
    "Dual-Threat": "#8E24AA",
    "Deep Threat": "#3F51B5",

    "Pocket Passer": "#90CAF9",
    Scrambler: "#4DD0E1",
    "Power Back": "#A1887F",
    "Receiving Back": "#81C784",
    "Slot WR": "#CE93D8",
    "Field-Stretcher": "#7986CB",
    "Red Zone TE": "#EF5350",
    "Volume TE": "#66BB6A",
  };

  const icons: Record<string, JSX.Element> = {
    Elite: crownIcon(),
    Starter: starIcon(),
    Flex: lightningIcon(),
    Depth: circleIcon(),

    Workhorse: dumbbellIcon(),
    "Target Hog": bullseyeIcon(),
    "Red Zone Threat": flameIcon(),
    "Dual-Threat": splitIcon(),
    "Deep Threat": rocketIcon(),

    "Pocket Passer": qbPocketIcon(),
    Scrambler: qbRunIcon(),
    "Power Back": hammerIcon(),
    "Receiving Back": handsIcon(),
    "Slot WR": routeIcon(),
    "Field-Stretcher": speedIcon(),
    "Red Zone TE": goalpostIcon(),
    "Volume TE": bookIcon(),
  };

  return (
    <div
      className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold"
      style={{
        backgroundColor: colors[value] ?? "#9E9E9E",
        color: "#000",
      }}
    >
      {icons[value] ?? null}
      <span>{value}</span>
    </div>
  );
}

/* ---------------- SVG ICONS ---------------- */

function crownIcon() {
  return (
    <svg width="12" height="12" fill="currentColor">
      <path d="M2 10h8l-1-6-3 2-3-2-1 6z" />
    </svg>
  );
}

function starIcon() {
  return (
    <svg width="12" height="12" fill="currentColor">
      <path d="M6 1l1.8 3.6L12 5l-3 3 1 4-4-2-4 2 1-4L0 5l4.2-.4z" />
    </svg>
  );
}

function lightningIcon() {
  return (
    <svg width="12" height="12" fill="currentColor">
      <path d="M4 0l6 4-4 1 4 7-6-5 3-1z" />
    </svg>
  );
}

function circleIcon() {
  return (
    <svg width="12" height="12" fill="currentColor">
      <circle cx="6" cy="6" r="5" />
    </svg>
  );
}

function dumbbellIcon() {
  return (
    <svg width="12" height="12" fill="currentColor">
      <path d="M1 4h2v4H1V4zm8 0h2v4H9V4zM4 5h4v2H4V5z" />
    </svg>
  );
}

function bullseyeIcon() {
  return (
    <svg width="12" height="12" fill="currentColor">
      <circle cx="6" cy="6" r="5" />
      <circle cx="6" cy="6" r="3" fill="#fff" />
      <circle cx="6" cy="6" r="1" />
    </svg>
  );
}

function flameIcon() {
  return (
    <svg width="12" height="12" fill="currentColor">
      <path d="M6 0C4 3 8 4 8 7s-2 5-4 5-4-2-4-5 4-4 2-7z" />
    </svg>
  );
}

function splitIcon() {
  return (
    <svg width="12" height="12" fill="currentColor">
      <path d="M2 2l4 4-4 4M10 2l-4 4 4 4" />
    </svg>
  );
}

function rocketIcon() {
  return (
    <svg width="12" height="12" fill="currentColor">
      <path d="M2 10l3-8 5 5-8 3z" />
    </svg>
  );
}

function qbPocketIcon() {
  return (
    <svg width="12" height="12" fill="currentColor">
      <circle cx="6" cy="3" r="2" />
      <rect x="4" y="5" width="4" height="6" />
    </svg>
  );
}

function qbRunIcon() {
  return (
    <svg width="12" height="12" fill="currentColor">
      <path d="M6 1l2 3-2 2-2-1 1-3zM4 7l4 2-1 2-4-2z" />
    </svg>
  );
}

function hammerIcon() {
  return (
    <svg width="12" height="12" fill="currentColor">
      <path d="M1 1l4 1 1 4-2 2-3-3z" />
    </svg>
  );
}

function handsIcon() {
  return (
    <svg width="12" height="12" fill="currentColor">
      <path d="M2 2l2 3-2 3M10 2l-2 3 2 3" />
    </svg>
  );
}

function routeIcon() {
  return (
    <svg width="12" height="12" fill="currentColor">
      <path d="M2 10l4-8 4 3-3 5z" />
    </svg>
  );
}

function speedIcon() {
  return (
    <svg width="12" height="12" fill="currentColor">
      <path d="M1 6h10M3 3h6M3 9h6" />
    </svg>
  );
}

function goalpostIcon() {
  return (
    <svg width="12" height="12" fill="currentColor">
      <rect x="2" y="1" width="2" height="5" />
      <rect x="8" y="1" width="2" height="5" />
      <rect x="5" y="6" width="2" height="5" />
    </svg>
  );
}

function bookIcon() {
  return (
    <svg width="12" height="12" fill="currentColor">
      <rect x="2" y="2" width="8" height="8" />
      <line x1="6" y1="2" x2="6" y2="10" stroke="#000" strokeWidth="1" />
    </svg>
  );
}
