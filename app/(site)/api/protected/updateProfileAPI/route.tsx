"use server";
import pool from "@/lib/db";
import { NextResponse, NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import { jwtDecode } from "jwt-decode";

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

  const req = request as NextRequest;
  const formData = await req.formData();
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const contact = formData.get("contact") as string;
  const image = formData.get("file_input") as File;

  if (!image || typeof image === "string") {
    return NextResponse.json(
      { success: false, message: "Invalid image file" },
      { status: 400 },
    );
  }

  if (!contact || !name || !email) {
    return NextResponse.json(
      { success: false, message: "Contact, name, and email are required" },
      { status: 400 },
    );
  }

  try {
    // Update user profile in the database
    const [result] = await pool.query(
      "UPDATE user SET username = ?, email = ?, contact = ?, profile = ? WHERE user_id = ?",
      [name, email, contact, image.name, userId],
    );
    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "User not found or no changes made" },
        { status: 404 },
      );
    }

    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    // Save to /public/images folder
    const filePath = path.join(process.cwd(), "public", "images", image.name);
    // Make sure the folder exists
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    // Write the file
    fs.writeFileSync(filePath, new Uint8Array(buffer));
    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Database error:", (error as Error).message);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
