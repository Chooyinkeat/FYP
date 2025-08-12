"use server";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { jwtDecode } from "jwt-decode";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const decoded: any = jwtDecode(token);
  const userId = decoded.userId;

  try {
    const [rows] = await pool.query(
      "SELECT user_id, username, email, contact, profile FROM user WHERE user_id = ?",
      [userId],
    );

    if ((rows as any[]).length === 0) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    const user = (rows as any[])[0];

    return NextResponse.json({
      success: true,
      message: "User profile fetched successfully",
      user: {
        userId: user.user_id,
        username: user.username,
        email: user.email,
        contact: user.contact,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
