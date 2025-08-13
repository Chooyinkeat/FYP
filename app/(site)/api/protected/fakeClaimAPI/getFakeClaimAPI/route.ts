"use server";
import pool from "@/lib/db";
import { jwtDecode } from "jwt-decode";
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({
      success: false,
      message: "Unauthorized",
      status: 401,
    });
  }

  const decoded: any = jwtDecode(token);
  const userId = decoded.userId;

  try {
    const [rows]: any = await pool.query(
      `SELECT * FROM fake_claim_item WHERE user_id = ? AND is_closed = 0`,
      [userId],
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Found item not found or unauthorized" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Fake claim items fetched successfully",
      data: rows,
      status: 200,
    });
  } catch (error) {
    console.log("Database query error:", error);
    return NextResponse.json(
      { success: false, message: "Database query error" },
      { status: 500 },
    );
  }
}
