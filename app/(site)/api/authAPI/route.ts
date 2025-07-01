import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_hour = process.env.JWT_EXPIRATION || "1h";

export async function POST(request: NextRequest) {
  const { username, email, profile, type } = await request.json();

  if (!username || !email || !profile || !type) {
    return NextResponse.json({
      success: false,
      message: "Username, email, profile, and type are required",
    });
  }

  try {
    // ✅ Check if user exists (SSO support)
    const [existingUsers] = await pool.query(
      "SELECT * FROM user WHERE email = ? AND sign_up_type = ? LIMIT 1",
      [email, type],
    );

    let userId: number;

    if ((existingUsers as any[]).length > 0) {
      // ✅ User already exists — treat as login
      const user = (existingUsers as any[])[0];
      userId = user.user_id; // adapt to your DB column
    } else {
      // ✅ Insert new user
      const [result] = await pool.query(
        "INSERT INTO user (username, email, profile, sign_up_type) VALUES (?, ?, ?, ?)",
        [username, email, profile, type],
      );

      if ((result as any).affectedRows === 0) {
        return NextResponse.json({
          success: false,
          message: "Failed to create user",
          status: 500,
        });
      }

      userId = (result as any).insertId;
    }

    // ✅ Create JWT token
    const token = jwt.sign({ userId, email }, JWT_SECRET, {
      expiresIn: JWT_hour,
    });

    // ✅ Set HttpOnly cookie
    const response = NextResponse.json({
      status: 200,
      success: true,
      message: "User signed in via SSO",
      user: {
        userId,
        profile,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("SSO Registration/Login error:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
