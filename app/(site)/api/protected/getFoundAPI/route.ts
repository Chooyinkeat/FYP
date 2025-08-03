"use server";
import pool from "@/lib/db";
import { jwtDecode } from "jwt-decode";
import { NextResponse, NextRequest } from "next/server";

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
      `SELECT category, location, date, time, status, found_id, user_id FROM found_item WHERE status = 0 ORDER BY created_date`,
    );
    if ((rows as any[]).length === 0) {
      return NextResponse.json(
        { success: false, message: "No found items available" },
        { status: 404 },
      );
    }

    const foundItems = (rows as any[]).map((item) => ({
      category: item.category,
      location: item.location,
      date: item.date,
      time: item.time,
      status: item.status,
      foundId: item.found_id,
      userId: item.user_id,
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
