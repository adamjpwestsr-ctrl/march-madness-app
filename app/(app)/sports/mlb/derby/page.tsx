"use client";

import dynamic from "next/dynamic";

const DerbyModal = dynamic(() => import("../components/DerbyModal"), {
  ssr: false,
});

export default function DerbyPage() {
  return (
    <DerbyModal
      onClose={() => {
        window.location.href = "/sports/mlb";
      }}
    />
  );
}
