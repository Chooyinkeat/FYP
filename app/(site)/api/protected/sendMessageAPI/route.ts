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

  const decoded: any = jwtDecode(token); // Already verified by middleware
  const userId = decoded.userId;

  const { receiverId, message } = await request.json();

  if (!receiverId || !message) {
    return NextResponse.json(
      { success: false, message: "Invalid request data" },
      { status: 400 },
    );
  }

  try {
    const [rows] = await pool.query(
      `INSERT INTO chat (sender_id, receiver_id, message) VALUES (?, ?, ?)`,
      [userId, receiverId, message],
    );
    return NextResponse.json(
      { success: true, message: "Message sent successfully", data: rows },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
