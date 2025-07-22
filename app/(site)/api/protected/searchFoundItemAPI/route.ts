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

  const { category } = await request.json();
  if (!category) {
    return NextResponse.json(
      { success: false, message: "Invalid request data" },
      { status: 400 },
    );
  }

  try {
    const [rows] = await pool.query(
      `SELECT category, location, date, time, status, found_id, user_id  FROM found_item WHERE TRIM(category) = ? AND status = 0`,
      [category],
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
      data: foundItems,
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching found items:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch found items" },
      { status: 500 },
    );
  }
}
