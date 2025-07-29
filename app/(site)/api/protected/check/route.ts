"use server";
// /app/api/protected/check/route.ts

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, message: "No token" },
      { status: 401 },
    );
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return NextResponse.json({
      success: true,
      userId: payload.userId,
      profile: payload.profile,
      status: 200,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Invalid token" },
      { status: 401 },
    );
  }
}
