"use server";

import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_hour = process.env.JWT_EXPIRATION || "1h";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  if (!email || !password) {
    return NextResponse.json({
      success: false,
      message: "Email and password are required",
    });
  }

  try {
    const [rows] = await pool.query(
      "SELECT * FROM user WHERE email = ? AND sign_up_type = 0 LIMIT 1",
      [email],
    );

    if ((rows as any[]).length === 0) {
      return NextResponse.json({
        success: false,
        message: "No result found for this email",
      });
    }

    const user = (rows as any[])[0];

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json({
        success: false,
        message: "Invalid email or password",
        status: 401,
      });
    }
    if (user.status === 3) {
      return NextResponse.json({
        success: false,
        message: "This user has been banned",
        status: 400,
      });
    }
    let role = user.is_admin ? 1 : 0;
    let status = user.status;
    const token = jwt.sign(
      { userId: user.user_id, email: user.email, role, status },
      JWT_SECRET,
      { expiresIn: JWT_hour },
    );

    const response = NextResponse.json({
      success: true,
      message: "Logged in",
      user: {
        userId: user.user_id,
        profile: user.profile,
        role: role,
        status: status,
      },
      status: 200,
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
    console.error("Login error:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error",
    });
  }
}
