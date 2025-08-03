"use server";
import pool from "@/lib/db";
import { NextResponse, NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";
import cloudinary from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({
      success: false,
      message: "Unauthorized",
      status: 401,
    });
  }

  const decoded: any = jwtDecode(token);
  const userId = decoded.userId;

  const formData = await request.formData();
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const contact = formData.get("contact") as string;
  const image = formData.get("file_input") as File;

  if (!image || typeof image === "string") {
    return NextResponse.json({
      success: false,
      message: "Invalid image file",
      status: 400,
    });
  }

  if (!contact || !name || !email) {
    return NextResponse.json({
      success: false,
      message: "Contact, name, and email are required",
      status: 400,
    });
  }

  // Convert image file to buffer
  const arrayBuffer = await image.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Upload to Cloudinary and get secure_url
  let secureUrl: string;
  try {
    const uploadResult: any = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "lost-and-found" }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        })
        .end(buffer);
    });

    secureUrl = uploadResult.secure_url;
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to upload image",
      status: 500,
    });
  }

  try {
    const [result] = await pool.query(
      "UPDATE user SET username = ?, email = ?, contact = ?, profile = ? WHERE user_id = ?",
      [name, email, contact, secureUrl, userId],
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({
        success: false,
        message: "User not found or no changes made",
        status: 404,
      });
    }
    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      status: 200,
    });
  } catch (error) {
    console.error("Database error:", (error as Error).message);
    return NextResponse.json({
      success: false,
      message: "Internal Server Error",
      status: 500,
    });
  }
}
