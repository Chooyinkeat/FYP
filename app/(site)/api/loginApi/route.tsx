import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
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
    // ✅ Find user by email only
    const [rows] = await pool.query(
      "SELECT * FROM user WHERE email = ? LIMIT 1",
      [email],
    );

    if ((rows as any[]).length === 0) {
      return NextResponse.json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = (rows as any[])[0];

    // ✅ Compare entered password with hashed password in DB
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // ✅ Create JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: JWT_hour,
    });

    // ✅ Set secure, HttpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60, // 1 hour in seconds
    });

    return NextResponse.json({ success: true, message: "Logged in" });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error",
    });
  }
}
