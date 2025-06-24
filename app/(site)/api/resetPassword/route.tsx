"use server";
import pool from "@/lib/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { email, password, otp, jwtToken } = await request.json();

  if (!email || !password || !otp || !jwtToken) {
    return NextResponse.json({
      success: false,
      message: "Email, password, OTP, and JWT token are required",
      status: 400,
    });
  }

  // Verify the JWT token
  try {
    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET!);
    if (decoded.email !== email) {
      return NextResponse.json({
        success: false,
        message: "Email mismatch",
        status: 400,
      });
    }

    if (decoded.otp !== otp) {
      return NextResponse.json({
        success: false,
        message: "Invalid OTP",
        status: 400,
      });
    }
  } catch (error) {
    console.error("JWT verification error:", error);
    return NextResponse.json({
      success: false,
      message: "Invalid or expired JWT token" + error,
      status: 400,
    });
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Update the user's password in the database
  const [result] = await pool.query(
    "UPDATE user SET password = ? WHERE email = ?",
    [hashedPassword, email],
  );

  if ((result as any).affectedRows === 0) {
    return NextResponse.json({
      success: false,
      message: "Failed to update password",
      status: 500,
    });
  }

  return NextResponse.json({
    success: true,
    message: "Password reset successfully",
    status: 200,
  });
}
