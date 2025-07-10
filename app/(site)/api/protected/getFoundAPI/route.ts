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

  const decoded: any = jwtDecode(token); // Already verified by middleware
  const userId = decoded.userId;
  try {
    // Get recent 18 found items
    const [rows] = await pool.query(
      `SELECT image_url_payload, question_payload, status FROM found_item WHERE status = 0 ORDER BY created_date DESC LIMIT 18`,
    );
    if ((rows as any[]).length === 0) {
      return NextResponse.json(
        { success: false, message: "No found items available" },
        { status: 404 },
      );
    }

    const foundItems = (rows as any[]).map((item) => ({
      imageUrl: JSON.parse(item.image_url_payload),
      question: JSON.parse(item.question_payload),
      status: item.status,
    }));

    return NextResponse.json({
      success: true,
      message: "Found items fetched successfully",
      foundItems,
      status: 200,
    });
  } catch (error) {
    console.log("Error fetching found items: ", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
