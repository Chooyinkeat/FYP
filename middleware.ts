// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  // If no token, redirect or block
  if (!token) {
    const isAPI = request.nextUrl.pathname.startsWith("/api/");

    // Block API access with 401
    if (isAPI) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - middleware" },
        { status: 401 },
      );
    }

    // Redirect page requests to login
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

// 🔥 Apply to both page and API routes
export const config = {
  matcher: ["/dashboard/:path*", "/api/user-info"],
};
