"use server";
import pool from "@/lib/db";
import { jwtDecode } from "jwt-decode";
import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({
      success: false,
      message: "Unauthorized",
      status: 401,
    });
  }

  const decoded: any = jwtDecode(token);
  const { itemId, type } = await request.json();

  if (!itemId || !type) {
    return NextResponse.json({
      success: false,
      message: "Invalid request data",
      status: 400,
    });
  }

  let query = "";
  if (type === "lost") {
    query = `UPDATE lost_item SET status = 1 WHERE lost_id = ?`;
  } else if (type === "found") {
    query = `UPDATE found_item SET status = 1 WHERE found_id = ?`;
  }

  try {
    const [result] = await pool.query(query, [itemId]);
    if ((result as any).affectedRows === 0) {
      return NextResponse.json({
        success: false,
        message: "Item not found or already updated",
        status: 404,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Item status updated successfully",
      status: 200,
    });
  } catch (error) {
    console.log("Error updating item status:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to update item status",
      status: 500,
    });
  }
}
