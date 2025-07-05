"use server";
import pool from "@/lib/db";
import { jwtDecode } from "jwt-decode";
import fs from "fs";
import path from "path";
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

  const decoded: any = jwtDecode(token); // Already verified by middleware
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
      if (type === 1) {
        tinyIntType = 1;
      } else if (type === 2) {
        tinyIntType = 2;
      }

      const matches = message.match(/^data:(.*);base64,(.*)$/);

      if (!matches || matches.length < 3) {
        return NextResponse.json(
          { success: false, message: "Invalid base64 format" },
          { status: 400 },
        );
      }

      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, "base64");
      const uploadsDir = path.join(process.cwd(), "public", "images");
      fs.mkdirSync(uploadsDir, { recursive: true });
      const safeFileName = `${Date.now()}-${file_name}`;
      const filePath = path.join(uploadsDir, safeFileName);
      fs.writeFileSync(filePath, new Uint8Array(buffer));
      // Store public URL path in DB
      finalMessage = `/images/${safeFileName}`;
    }
    // Always use finalMessage in DB
    await pool.query(
      `INSERT INTO chat (sender_id, receiver_id, message, type)
   VALUES (?, ?, ?, ?)`,
      [userId, receiverId, finalMessage, tinyIntType],
    );

    return NextResponse.json(
      { success: true, message: "Message sent successfully" },
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
