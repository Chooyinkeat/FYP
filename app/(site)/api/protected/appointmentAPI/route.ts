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

  const formData = await request.formData();
  const date = formData.get("date");
  const time = formData.get("time");
  const location = formData.get("location");
  const email = formData.get("email");
  const contact = formData.get("contact");
  const receiverId = formData.get("receiverId");
  if (!date || !time || !location || !email || !contact || !receiverId) {
    return NextResponse.json(
      { success: false, message: "All fields are required" },
      { status: 400 },
    );
  }

  try {
    await pool.query(
      "INSERT INTO appointment (user_id, receiver_id, date, time, location, email, contact, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [userId, receiverId, date, time, location, email, contact, 0],
    );

    return NextResponse.json({
      success: true,
      message: "Appointment created successfully",
      status: 200,
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json({
      success: false,
      message: "Error creating appointment",
      status: 500,
    });
  }
}
