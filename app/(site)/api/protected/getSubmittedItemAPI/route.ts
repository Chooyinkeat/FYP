"use server";
import pool from "@/lib/db";
import { jwtDecode } from "jwt-decode";
import { NextRequest, NextResponse } from "next/server";

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

  const { type } = await request.json();
  if (!type) {
    return NextResponse.json(
      { success: false, message: "Type is required" },
      { status: 400 },
    );
  }

  let sqlQuery = "";
  if (type === "0") {
    sqlQuery = `SELECT lost_id, category, description_payload, status FROM lost_item WHERE user_id = ? ORDER BY created_date DESC`;
  } else if (type === "1") {
    sqlQuery = `SELECT found_id, category, location, date, time, status FROM found_item WHERE user_id = ? ORDER BY created_date DESC`;
  }

  try {
    const [rows] = await pool.query(sqlQuery, [userId]);
    if ((rows as any[]).length === 0) {
      return NextResponse.json(
        { success: false, message: "No items found" },
        { status: 404 },
      );
    }

    const items = (rows as any[]).map((item) => {
      if (type === "0") {
        return {
          category: item.category,
          description: JSON.parse(item.description_payload),
          status: item.status,
          lostId: item.lost_id,
        };
      } else if (type === "1") {
        return {
          category: item.category,
          status: item.status,
          location: item.location,
          date: item.date,
          time: item.time,
          foundId: item.found_id,
        };
      }
    });

    return NextResponse.json({
      success: true,
      message: "Items fetched successfully",
      data: items,
      status: 200,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
