// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken"; // Optional: for token verification

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  // If no token, handle unauthorized access
  if (!token) {
    const isAPI = request.nextUrl.pathname.startsWith("/api/protected/");

    if (isAPI) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - middleware" },
        { status: 401 },
      );
    }

    // Redirect page requests to signin
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  // Optional: verify token validity
  try {
    jwt.verify(token, process.env.JWT_SECRET!);
  } catch (error) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  return NextResponse.next();
}

// ✅ Only protect secure routes, NOT /auth/* to avoid redirect loop
export const config = {
  matcher: [
    // Protect all API routes except auth/login and auth/register
    "/api/protected/:path*",
    "/profile/:path*",
  ],
};
