"use server";

import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

// Make sure these are in your .env.local file
const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({
      success: false,
      message: "Email is required",
      status: 400,
    });
  }

  // Check if the user exists
  const [user] = await pool.query(
    "SELECT user_id FROM user WHERE email = ? LIMIT 1",
    [email],
  );

  if ((user as any[]).length === 0) {
    return NextResponse.json({
      success: false,
      message: "User not found",
      status: 404,
    });
  }

  // ✅ Generate 6-digit random OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // ✅ Create a short-lived JWT with OTP and email
  const token = jwt.sign(
    { otp, email },
    JWT_SECRET,
    { expiresIn: `30m` }, // expires in 30 minutes
  );

  // send the OTP via email
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Hello Investigator, you have a new complaint",
      html: ``,
      text: "This is a test email from our system." + ` Your OTP is ${otp}`,
    };

    // ✅ Await instead of callback
    const info = await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      status: 200,
      token, // ✅ Send JWT token back to client
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to send OTP",
      status: 500,
    });
  }
}
