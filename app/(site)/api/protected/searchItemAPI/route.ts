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
  const userId = decoded.userId;

  const { category } = await request.json();
  if (!category) {
    return NextResponse.json(
      { success: false, message: "Invalid request data" },
      { status: 400 },
    );
  }

  try {
    // Get recent 18 lost items
    const [rows] = await pool.query(
      `SELECT category, image_payload, description_payload, status, user_id  FROM lost_item WHERE TRIM(category) = ? AND status = 0`,
      [category],
    );
    if ((rows as any[]).length === 0) {
      return NextResponse.json(
        { success: false, message: "No lost items available" },
        { status: 404 },
      );
    }
    const lostItems = (rows as any[]).map((item) => ({
      category: item.category,
      imageUrl: JSON.parse(item.image_payload),
      description: item.description_payload,
      status: item.status,
      userId: item.user_id,
    }));

    return NextResponse.json({
      success: true,
      message: "Lost items fetched successfully",
      data: lostItems,
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching lost items:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch lost items" },
      { status: 500 },
    );
  }
}
