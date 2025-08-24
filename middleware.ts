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
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // Role-based protection
    const pathname = request.nextUrl.pathname;

    if (pathname.startsWith("/dashboard")) {
      if (payload.role !== 1) {
        return NextResponse.redirect(new URL("/error", request.url));
      }
    }

    if (
      pathname.startsWith("/foundItems") ||
      pathname.startsWith("/submitItem")
    ) {
      if (payload.status === 2) {
        return NextResponse.redirect(new URL("/warning", request.url));
      }
    }
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
    "/foundItems/foundItems-details",
    "/lostItems",
    "/lostItems/lostItems-details",
    "/profile",
    "/docs",
    "/reports",
    "/appointment",
    "/appointment/view",
    "/dashboard/:path*",
  ],
};
