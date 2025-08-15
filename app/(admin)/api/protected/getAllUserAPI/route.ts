"use server";
import pool from "@/lib/db";
import { jwtDecode } from "jwt-decode";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const decoded: any = jwtDecode(token);
  try {
    const [rows] = await pool.query(
      "SELECT u.user_id, u.username, u.email, u.contact, u.profile, u.status, u.created_date, COUNT(DISTINCT f.found_id) AS found_count, COUNT(DISTINCT l.lost_id) AS lost_count FROM user u LEFT JOIN found_item f ON f.user_id = u.user_id LEFT JOIN lost_item l ON l.user_id = u.user_id WHERE u.is_admin = 0 GROUP BY u.user_id;",
    );

    if ((rows as any[]).length === 0) {
      return NextResponse.json(
        { success: false, message: "No users found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Users fetched successfully",
      data: rows,
      status: 200,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 500 },
    );
  }
}
