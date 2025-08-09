"use server";
import { Queue } from "bullmq";
import connection from "@/lib/redis";
import { jwtDecode } from "jwt-decode";
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
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

  const formData = await request.formData();
  const urls = JSON.parse(formData.get("urls") as string);
  console.log(Array.isArray(urls));

  const receiverId = formData.get("receiverId") as string;
  const email = formData.get("email") as string;
  const location = formData.get("location") as string;
  const date = formData.get("date") as string;
  const time = formData.get("time") as string;
  const contact = formData.get("contact") as string;

  if (
    !receiverId ||
    !urls ||
    !email ||
    !location ||
    !date ||
    !time ||
    !contact
  ) {
    return NextResponse.json(
      { success: false, message: "All fields are required" },
      { status: 400 },
    );
  }
  try {
    const [rows] = await pool.query(
      "SELECT email FROM user WHERE user_id = ? LIMIT 1",
      [receiverId],
    );

    if ((rows as any[]).length === 0) {
      return NextResponse.json({
        success: false,
        message: "No result found for this email",
        status: 404,
      });
    }
    await emailQueue.add(
      "sendEmail",
      {
        email: (rows as any[])[0].email,
        images: urls,
        userEmail: email,
        location: location,
        date: date,
        time: time,
        contact: contact,
      },
      {
        removeOnFail: {
          age: 60,
        },
      },
    );
    return NextResponse.json(
      {
        success: true,
        message: "Notification sent successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error processing email notification:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process email notification" },
      { status: 500 },
    );
  }
}
