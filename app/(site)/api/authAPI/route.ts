"use server";
import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

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
    const [existingUsers] = await pool.query(
      "SELECT * FROM user WHERE email = ? AND sign_up_type = ? LIMIT 1",
      [email, type],
    );

    let userId: number;
    let role: number;
    let userProfile: string;
    if ((existingUsers as any[]).length > 0) {
      const user = (existingUsers as any[])[0];
      userId = user.user_id;
      role = user.is_admin ? 1 : 0;
      userProfile = user.profile;
      if (user.status === 1) {
        return NextResponse.json({
          success: false,
          message: "This users has been banned",
          status: 400,
        });
      }
    } else {
      const [result] = await pool.query(
        "INSERT INTO user (username, email, profile, sign_up_type, is_admin, status) VALUES (?, ?, ?, ?, ?, ?)",
        [username, email, profile, type, 0, 0],
      );

      if ((result as any).affectedRows === 0) {
        return NextResponse.json({
          success: false,
          message: "Failed to create user",
          status: 500,
        });
      }

      userId = (result as any).insertId;
      role = 0;
      userProfile = profile;
    }

    const token = jwt.sign({ userId, email, role, userProfile }, JWT_SECRET, {
      expiresIn: JWT_hour,
    });

    const response = NextResponse.json({
      status: 200,
      success: true,
      message: "User signed in via SSO",
      user: {
        userId,
        role,
      },
      profile: userProfile,
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 3,
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
