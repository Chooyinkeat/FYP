"use server";
import pool from "@/lib/db";
import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }
  const { foundId } = await request.json();

  if (!foundId) {
    return NextResponse.json(
      { success: false, message: "Found ID is required" },
      { status: 400 },
    );
  }
  try {
    const [rows] = await pool.query(
      "SELECT question_payload FROM found_item WHERE found_id = ?",
      [foundId],
    );

    const foundItems = (rows as any[]).map((item) => ({
      questionPayload: JSON.parse(item.question_payload),
      foundId: foundId,
    }));

    return NextResponse.json({
      success: true,
      message: "Found items fetched successfully",
      data: foundItems,
      status: 200,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
