import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.redirect("/login");

  // Clear your session cookie
  res.cookies.set("mm_session", "", {
    path: "/",
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax",
  });

  return res;
}
