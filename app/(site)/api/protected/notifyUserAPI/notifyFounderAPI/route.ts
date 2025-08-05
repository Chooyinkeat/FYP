"use server";
import pool from "@/lib/db";
import { Queue } from "bullmq";
import connection from "@/lib/redis";
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
  const emailQueue = new Queue("exampleQueue", { connection });
  const { userId, results } = await request.json();

  if (!userId || !results) {
    return NextResponse.json(
      { success: false, message: "User ID and results are required" },
      { status: 404 },
    );
  }

  try {
    const [rows] = await pool.query(
      "SELECT email FROM user WHERE user_id = ? LIMIT 1",
      [userId],
    );

    if ((rows as any[]).length === 0) {
      return NextResponse.json({
        success: false,
        message: "No result found for this email",
        status: 404,
      });
    }

    await emailQueue.add(
      "notifyFounder",
      { email: (rows as any[])[0].email, results: results },
      {
        removeOnFail: {
          age: 60,
        },
      },
    );
    return NextResponse.json(
      { success: true, message: "Notification sent successfully" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error processing request" },
      { status: 500 },
    );
  }
}
