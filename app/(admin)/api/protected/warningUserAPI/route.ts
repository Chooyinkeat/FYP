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

  const { reportId, type, suspectedId, fakeClaimId } = await request.json();
  if (!reportId || !type || !suspectedId || !fakeClaimId) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Report ID, type, suspected ID, and fake claim ID are required",
      },
      { status: 400 },
    );
  }
  let sql = "";
  if (type === "warning") {
    sql = "UPDATE report SET status = 3 WHERE report_id = ?";
    // Update user status
    const [userResult] = await pool.query(
      "UPDATE user SET status = ? WHERE user_id = ?",
      [1, suspectedId],
    );
    if ((userResult as any).affectedRows === 0) {
      return NextResponse.json({
        success: false,
        message: "User not found or no changes made",
        status: 404,
      });
    }

    // Update fake claim status
    const [claimResult] = await pool.query(
      "UPDATE fake_claim_item SET status = ? WHERE fake_claim_id = ?",
      [3, fakeClaimId],
    );
    if ((claimResult as any).affectedRows === 0) {
      return NextResponse.json({
        success: false,
        message: "Fake claim not found or no changes made",
        status: 404,
      });
    }
  } else {
    sql = "UPDATE report SET status = 2 WHERE report_id = ?";
  }

  try {
    const [result] = await pool.query(sql, [reportId]);

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
    return NextResponse.json(
      { success: false, message: "Failed to update report status" },
      { status: 500 },
    );
  }
}
