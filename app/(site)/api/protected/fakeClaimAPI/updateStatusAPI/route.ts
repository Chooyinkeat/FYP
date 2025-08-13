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
  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({
      success: false,
      message: "Missing item ID",
      status: 400,
    });
  }

  try {
    const [result] = await pool.query(
      "UPDATE fake_claim_item SET is_closed=? WHERE fake_claim_id = ?",
      [1, id],
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({
        success: false,
        message: "User not found or no changes made",
        status: 404,
      });
    }
    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      status: 200,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Failed to update status",
      status: 500,
    });
  }
}
