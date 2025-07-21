"use server";
// import pool from "@/lib/db";
// import nodemailer from "nodemailer";
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

  const decoded: any = jwtDecode(token); // Already verified by middleware
  const userId = decoded.userId;
  const emailQueue = new Queue("exampleQueue", { connection });
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json(
      { success: false, message: "Email is required" },
      { status: 400 },
    );
  }
  await emailQueue.add(
    "sendEmail",
    { email },
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
  // try {
  //   // Check if the user exists
  //   const [rows] = await pool.query(
  //     "SELECT * FROM user WHERE email = ? LIMIT 1",
  //     [email],
  //   );

  //   if ((rows as any[]).length === 0) {
  //     return NextResponse.json({
  //       success: false,
  //       message: "User not found",
  //       status: 404,
  //     });
  //   }

  //   // send the OTP via email
  //   try {
  //     const transporter = nodemailer.createTransport({
  //       service: "gmail",
  //       auth: {
  //         user: process.env.EMAIL_USER,
  //         pass: process.env.EMAIL_PASS,
  //       },
  //     });

  //     const mailOptions = {
  //       from: process.env.EMAIL_USER,
  //       to: email,
  //       subject: "Hello, someone found your lost item",
  //       html: ``,
  //       text: "Hello, someone found your lost item. Please contact them for more details.",
  //     };

  //     // ✅ Await instead of callback
  //     const info = await transporter.sendMail(mailOptions);

  //     return NextResponse.json({
  //       success: true,
  //       message: "OTP sent successfully",
  //       status: 200,
  //       token, // ✅ Send JWT token back to client
  //     });
  //   } catch (error) {
  //     console.error("Error sending email:", error);
  //     return NextResponse.json({
  //       success: false,
  //       message: "Failed to send OTP",
  //       status: 500,
  //     });
  //   }
  // } catch (error) {}
}
