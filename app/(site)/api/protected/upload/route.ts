"use server";

import pool from "@/lib/db";
import { NextResponse, NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";
import cloudinary from "@/lib/cloudinary";

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
  const category = formData.get("category") as string;
  const status = formData.get("status") as string;
  const images = formData.getAll("images") as File[];

  if (!category || !status) {
    return NextResponse.json(
      {
        success: false,
        message: "Category, location, and status are required",
      },
      { status: 400 },
    );
  }

  if (!images || images.length === 0) {
    return NextResponse.json(
      {
        success: false,
        message: "At least one image is required",
      },
      { status: 400 },
    );
  }

  try {
    let sql = "";
    if (status == "Lost") {
      sql = `INSERT INTO lost_item (category, status, payload, user_id)
   VALUES (?, ?, ?, ?)`;
    } else {
      sql = `INSERT INTO found_item (category, status, payload, user_id)
   VALUES (?, ?, ?, ?)`;
    }

    const uploadedImageUrls: string[] = [];

    for (const image of images) {
      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "lost-and-found" }, (error, result) => {
            if (error) return reject(error);
            resolve(result);
          })
          .end(buffer);
      });

      uploadedImageUrls.push((uploadResult as any).secure_url);
    }
    const payload = uploadedImageUrls;

    await pool.query(sql, [
      category,
      0,
      JSON.stringify(payload), // this is where image URLs go
      userId,
    ]);

    return NextResponse.json(
      { success: true, message: "Lost item submitted successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Cloudinary upload failed:", error);
    return NextResponse.json(
      { success: false, message: "Upload failed", error: error.message },
      { status: 500 },
    );
  }
}
