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

  const decoded: any = jwtDecode(token);
  const userId = decoded.userId;

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json(
      { success: false, message: "Missing item ID" },
      { status: 400 },
    );
  }
  try {
    // Get recent 18 lost items
    const [rows] = await pool.query(
      `SELECT * FROM lost_item WHERE lost_id = ?`,
      [id],
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
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
