"use client";

import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  function handleLogout() {
    document.cookie =
      "mm_session=; path=/; max-age=0; SameSite=Lax";

    router.push("/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700"
    >
      Logout
    </button>
  );
}
