import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out" });

  response.cookies.set("token", "", {
    httpOnly: true,
    secure: true, // optional, but good for HTTPS
    sameSite: "lax",
    expires: new Date(0), // Expire immediately
    path: "/",
  });

  return response;
}
