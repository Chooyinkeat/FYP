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
        message: "Invalid email or password",
      });
    }

    const user = (rows as any[])[0];

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { userId: user.user_id, email: user.email }, // use actual column name from your DB
      JWT_SECRET,
      { expiresIn: JWT_hour },
    );

    // ✅ Set the cookie correctly on the response
    // for public access, use secure and sameSite attributes
    const response = NextResponse.json({
      success: true,
      message: "Logged in",
      user: {
        userId: user.user_id,
        profile: user.profile,
      },
    });
    // Set the token in the cookie
    // Ensure the cookie is set with httpOnly, secure, and sameSite attributes
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60, // 1 hour
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
