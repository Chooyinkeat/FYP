"use server";
import pool from "@/lib/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION;

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, contact, type, profile } =
      await request.json();

    if (!email || !password || !username || !contact || !type || !profile) {
      return NextResponse.json({
        success: false,
        message: "All fields are required",
      });
    }

    const [existing] = await pool.query(
      "SELECT user_id FROM user WHERE email = ? LIMIT 1",
      [email],
    );
    if ((existing as any[]).length > 0) {
      return NextResponse.json({
        success: false,
        message: "Email already registered",
        status: 409,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `INSERT INTO user (username, email, password, contact, sign_up_type, profile) VALUES (?, ?, ?, ?, ?, ?)`;
    const values = [username, email, hashedPassword, contact, type, profile];
    const result = await pool.query(query, values);

    const insertedId = (result as any).insertId;

    const token = jwt.sign({ userId: insertedId, email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRATION,
    });

    const response = NextResponse.json({
      success: true,
      message: "User registered and logged in",
      status: 200,
      user: {
        userId: insertedId,
        profile: profile,
      },
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
    console.error("Error during registration:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
