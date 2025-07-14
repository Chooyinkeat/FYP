"use server";

import pool from "@/lib/db";
import cloudinary from "@/lib/cloudinary";
import { jwtDecode } from "jwt-decode";
import { NextRequest, NextResponse } from "next/server";

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

  const formData = await request.formData();
  const metadataJson = formData.get("metadata") as string; // from clientside confirmation
  const images = formData.getAll("images") as File[];
  const date = formData.get("date") as string;
  const time = formData.get("time") as string;
  if (!metadataJson || images.length === 0 || !date || !time) {
    return NextResponse.json(
      { success: false, message: "Missing required fields" },
      { status: 400 },
    );
  }

  try {
    const aiResults = JSON.parse(metadataJson); // Must match earlier Gemini structure

    const imageUrls: string[] = [];
    const uploadedResults: any[] = [];

    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const buffer = Buffer.from(await file.arrayBuffer());

      const uploadResult: any = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "lost-and-found" }, (err, result) => {
            if (err) return reject(err);
            resolve(result);
          })
          .end(buffer);
      });

      imageUrls.push(uploadResult.secure_url);
      uploadedResults.push({
        imageUrl: uploadResult.secure_url,
        metadata: aiResults[i]?.metadata || {},
        questions: aiResults[i]?.questions || [],
        date: date,
        time: time,
      });
    }

    await pool.query(
      `INSERT INTO found_item (status, image_url_payload, question_payload, user_id) VALUES (?, ?, ?, ?)`,
      [0, JSON.stringify(imageUrls), JSON.stringify(aiResults), userId],
    );

    return NextResponse.json({
      success: true,
      message: "Item uploaded and stored",
      status: 200,
    });
  } catch (error: any) {
    console.error("Upload failed:", error);
    return NextResponse.json(
      { success: false, message: "Upload failed", error: error.message },
      { status: 500 },
    );
  }
}
