import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  try {
    // jose expects a Uint8Array for the secret
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    return NextResponse.next();
  } catch (error) {
    console.error("❌ Invalid or expired token:", error);
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }
}

export const config = {
  matcher: [
    "/api/protected/:path*",
    "/submitItem",
    "/foundItems",
    "/lostItems",
    "/profile",
    "/docs",
  ],
};
