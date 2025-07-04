"use server";

import pool from "@/lib/db";
import { jwtDecode } from "jwt-decode";
import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const decoded: any = jwtDecode(token); // Already verified by middleware
  const userId = decoded.userId;

  const { username } = await request.json();
  if (!username) {
    return NextResponse.json(
      { success: false, message: "Invalid request data" },
      { status: 400 },
    );
  }

  try {
    const [rows] = await pool.query(
      `SELECT user_id, username, profile FROM user WHERE TRIM(username) = ?`,
      [username],
    );

    if ((rows as any[]).length === 0) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: rows }, { status: 200 });
  } catch (error) {
    console.log("Error searching user: ", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
