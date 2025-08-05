"use server";

import pool from "@/lib/db";
import { jwtDecode } from "jwt-decode";
import cloudinary from "@/lib/cloudinary";
import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const decoded: any = jwtDecode(token);
  const userId = decoded.userId;

  const { receiverId, message, type, mime_type, file_name } =
    await request.json();

  if (!receiverId || !message) {
    return NextResponse.json(
      { success: false, message: "Invalid request data" },
      { status: 400 },
    );
  }

  try {
    let finalMessage = message;
    let tinyIntType = 0;

    if (type !== 0 && mime_type && file_name) {
      // Determine if it's image or video
      if (type === 1) tinyIntType = 1;
      else if (type === 2) tinyIntType = 2;

      // Parse base64 content
      const matches = message.match(/^data:(.*);base64,(.*)$/);
      if (!matches || matches.length < 3) {
        return NextResponse.json(
          { success: false, message: "Invalid base64 format" },
          { status: 400 },
        );
      }

      const base64Data = `data:${matches[1]};base64,${matches[2]}`;

      // Upload to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(base64Data, {
        folder: "chat",
        public_id: `${Date.now()}-${file_name}`,
        resource_type: "auto", // auto-detect image/video
      });

      finalMessage = uploadResult.secure_url; // Use Cloudinary URL
    }

    // Insert into DB
    await pool.query(
      `INSERT INTO chat (sender_id, receiver_id, message, type)
       VALUES (?, ?, ?, ?)`,
      [userId, receiverId, finalMessage, tinyIntType],
    );

    return NextResponse.json(
      {
        success: true,
        message: "Message sent successfully",
        url: finalMessage,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
