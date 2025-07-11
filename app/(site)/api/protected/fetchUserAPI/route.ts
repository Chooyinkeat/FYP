"use server";
import pool from "@/lib/db";
import { NextResponse, NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const decoded: any = jwtDecode(token);
  const { userId } = await request.json();
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "User ID is required" },
      { status: 400 },
    );
  }

  try {
    const [rows] = await pool.query(
      "SELECT username, email, contact, profile FROM user WHERE user_id = ? LIMIT 1",
      [userId],
    );

    if ((rows as any[]).length === 0) {
      return NextResponse.json({
        success: false,
        message: "User not found",
      });
    }

    const user = (rows as any[])[0];
    return NextResponse.json({
      success: true,
      status: 200,
      user: {
        userId: user.user_id,
        username: user.username,
        email: user.email,
        contact: user.contact,
        profile: user.profile,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
