"use server";

import { NextResponse, NextRequest } from "next/server";
import pool from "@/lib/db";
import { jwtDecode } from "jwt-decode";

export async function POST(request: NextRequest) {
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
    const { receiverId } = await request.json();

    if (!receiverId) {
      return NextResponse.json(
        { success: false, message: "Receiver ID is required" },
        { status: 400 },
      );
    }

    // Fetch messages between the user and the receiver
    const [messages] = await pool.query(
      `SELECT * FROM chat WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY created_date ASC`,
      [userId, receiverId, receiverId, userId],
    );

    return NextResponse.json({ success: true, data: messages, status: 200 });
  } catch (error) {
    console.log("Error parsing request JSON", error);
    return NextResponse.json(
      { success: false, message: "Invalid request" },
      { status: 400 },
    );
  }
}
