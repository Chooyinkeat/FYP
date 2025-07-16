"use server";
import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const decoded: any = jwtDecode(token); // Already verified by middleware
  const userId = decoded.userId;
  try {
    const [rows] = await pool.query(
      `SELECT 
        l.lost_id,
        l.image_payload AS lost_image,
        l.description_payload AS lost_description,
        f.found_id,
        f.image_url_payload AS found_image,
        f.question_payload AS found_question,
        l.user_id
        FROM lost_items l
        JOIN found_items f ON l.user_id = f.user_id
        WHERE l.user_id = ?;
        `,
      [userId],
    );

    if ((rows as any[]).length === 0) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "User profile fetched successfully",
      data: {
        lostItems: (rows as any[]).map((row) => ({
          id: row.lost_id,
          image: row.lost_image,
          description: row.lost_description,
        })),
        foundItems: (rows as any[]).map((row) => ({
          id: row.found_id,
          image: row.found_image,
          question: row.found_question,
        })),
      },
      status: 200,
    });
  } catch (error) {
    console.log("Error fetching user profile:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch user profile" },
      { status: 500 },
    );
  }
}
