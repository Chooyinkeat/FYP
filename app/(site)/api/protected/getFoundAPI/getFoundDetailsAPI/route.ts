"use server";
import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

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

  const { foundId } = await request.json();
  if (!foundId) {
    return NextResponse.json(
      { success: false, message: "Missing foundId" },
      { status: 400 },
    );
  }

  try {
    const [rows] = await pool.query(
      "SELECT category, location, date, time, status, found_id, user_id FROM found_item WHERE found_id = ?",
      [foundId],
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

    return NextResponse.json(
      { success: true, data: foundItems },
      { status: 200 },
    );
  } catch (error) {
    console.log("Error fetching found item details: ", error);
    return NextResponse.json(
      { success: false, message: "Error fetching found item" },
      { status: 500 },
    );
  }
}
