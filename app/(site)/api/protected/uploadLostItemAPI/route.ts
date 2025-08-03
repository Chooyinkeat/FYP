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
  const category = formData.get("category") as string;
  const location = formData.get("location") as string;
  const description = formData.get("description") as string;
  const date = formData.get("date") as string;
  const time = formData.get("time") as string;
  const images = formData.getAll("images") as File[];

  if (!category || !location || !description || !date || !time) {
    return NextResponse.json(
      { success: false, message: "Missing required fields" },
      { status: 400 },
    );
  }

  try {
    const imageUrls: string[] = [];
    const descriptionPayload = {
      category: category || "",
      location: location || "",
      description: description || "",
      date: date || "",
      time: time || "",
    };
    if (images.length !== 0) {
      // Upload each image to Cloudinary
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
      }
    }
    await pool.query(
      `INSERT INTO lost_item (status, category,image_payload, description_payload, user_id) VALUES (?, ?, ?, ?, ?)`,
      [
        0,
        category,
        JSON.stringify(imageUrls),
        JSON.stringify(descriptionPayload),
        userId,
      ],
    );
    return NextResponse.json(
      { success: true, message: "Files uploaded successfully" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to upload files" },
      { status: 500 },
    );
  }
}
