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
  const userId = decoded.userId;
  const { appointmentId, type } = await request.json();

  if (!appointmentId || !type) {
    return NextResponse.json({
      success: false,
      message: "Missing appointmentId or type",
      status: 400,
    });
  }
  let status = 0;
  if (type === "accept") {
    status = 1;
  } else if (type === "reject") {
    status = 2;
  }
  try {
    const [result] = await pool.query(
      "UPDATE appointment SET status = ? WHERE appointment_id = ? AND user_id = ?",
      [status, appointmentId, userId],
    );

    if (!result || Number((result as any).affectedRows) === 0) {
      return NextResponse.json({
        success: false,
        message: "Item not found or already updated",
        status: 404,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Appointment status updated successfully",
      status: 200,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Failed to update appointment status",
      status: 500,
    });
  }
}
