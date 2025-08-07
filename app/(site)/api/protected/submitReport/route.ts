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
  const { title, description, reason, caseId } = await request.json();

  if (!title || !description || !reason || !caseId) {
    return NextResponse.json(
      { success: false, message: "Invalid request data" },
      { status: 400 },
    );
  }

  try {
    const query = `
        INSERT INTO report (user_id, case_id, title, description, reason, status)
        VALUES (?, ?, ?, ?, ?, ?)
        `;
    const values = [userId, caseId, title, description, reason, "0"];

    const result = await pool.query(query, values);
    if ((result as any[]).length > 0) {
      return NextResponse.json({
        success: false,
        message: "Email already registered",
        status: 409,
      });
    }
    // update fake claim status to 1
    const updateQuery = `
        UPDATE fake_claim_item
        SET status = 1
        WHERE fake_claim_id = ? 
        `;
    await pool.query(updateQuery, [caseId]);

    return NextResponse.json(
      { success: true, message: "Report submitted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error submitting report:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit report" },
      { status: 500 },
    );
  }
}
