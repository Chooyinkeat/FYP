import pool from "@/lib/db"; // Adjust the import path as necessary
import jwt from "jsonwebtoken";
import { cookies } from "next/headers"; // For setting cookies in Next.js App Router
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

const JWT_SECRET = process.env.JWT_SECRET!; // Put this in .env.local
const JWT_hour = process.env.JWT_EXPIRATION; // Default to 1 hour if not set

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  if (!email || !password) {
    return NextResponse.json({
      success: false,
      message: "Email and password are required",
    });
  }

  try {
    const query = `SELECT * FROM users WHERE email = ? AND password = ?`;
    const values = [email, password];
    const [rows] = await pool.query(query, values);

    if ((rows as any[]).length > 0) {
      const user = (rows as any[])[0];

      // ✅ Create JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        {
          expiresIn: JWT_hour,
        },
      );

      // ✅ Set cookie
      const cookieStore = await cookies(); // ⬅️ Add await here
      cookieStore.set("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 3600,
      });

      return NextResponse.json({ success: true, message: "Logged in" });
    } else {
      return NextResponse.json({
        success: false,
        message: "Invalid credentials",
      });
    }
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error",
    });
  }
}
