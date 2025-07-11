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
  try {
    // Get recent 18 lost items
    const [rows] = await pool.query(
      `SELECT image_payload, description_payload, status, user_id FROM lost_item WHERE status = 0 ORDER BY created_date DESC LIMIT 18`,
    );
    if ((rows as any[]).length === 0) {
      return NextResponse.json(
        { success: false, message: "No lost items available" },
        { status: 404 },
      );
    }

    const lostItems = (rows as any[]).map((item) => ({
      imageUrl: JSON.parse(item.image_payload),
      description: item.description_payload,
      status: item.status,
      userId: item.user_id,
    }));

    return NextResponse.json({
      success: true,
      message: "Lost items fetched successfully",
      lostItems,
      status: 200,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
