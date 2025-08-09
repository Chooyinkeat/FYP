"use server";
import pool from "@/lib/db";
import { NextResponse, NextRequest } from "next/server";
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
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "User ID is required" },
      { status: 400 },
    );
  }

  try {
    const [rows] = await pool.query(
      `SELECT * FROM appointment WHERE user_id =? OR receiver_id =?`,
      [userId, userId],
    );
    if ((rows as any[]).length === 0) {
      return NextResponse.json(
        { success: false, message: "No appointment found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Appointment fetch successfully",
      data: rows,
      status: 200,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to retrieve appointments" },
      { status: 500 },
    );
  }
}
