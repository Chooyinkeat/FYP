"use server";
import pool from "@/lib/db";
import { jwtDecode } from "jwt-decode";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const decoded: any = jwtDecode(token);
  try {
    const [rows] = await pool.query(
      "SELECT * FROM report AS r JOIN fake_claim_item AS f ON r.case_id = f.fake_claim_id WHERE r.status = 0;",
    );

    if ((rows as any[]).length === 0) {
      return NextResponse.json(
        { success: false, message: "No reports found" },
        { status: 404 },
      );
    }
    return NextResponse.json({
      success: true,
      message: "Reports fetched successfully",
      data: rows,
      status: 200,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
