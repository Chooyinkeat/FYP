"use server";
import pool from "@/lib/db";
import { jwtDecode } from "jwt-decode";
import cloudinary from "@/lib/cloudinary";
import { NextResponse, NextRequest } from "next/server";

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
  const foundId = formData.get("foundId") as string;
  const foundItemUserId = formData.get("foundItemUserId") as string;
  const images = formData.getAll("images") as File[];

  if (!foundId || !foundItemUserId || images.length === 0) {
    return NextResponse.json(
      { success: false, message: "Missing required fields", status: 400 },
      { status: 400 },
    );
  }
  try {
    const [rows]: any = await pool.query(
      `SELECT image_url_payload FROM found_item WHERE found_id = ? AND user_id = ?`,
      [foundId, foundItemUserId],
    );

    if (rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Found item not found or unauthorized",
          status: 404,
        },
        { status: 404 },
      );
    }

    // Upload images to Cloudinary
    const imageUrls: string[] = [];

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
    const originalImages = rows.map((row: any) => ({
      image_url_payload: row.image_url_payload,
    }));
    const payload = {
      userUploadImage: imageUrls,
      originalImages,
    };

    // insert into fake_claim_item table
    const result = await pool.query(
      `INSERT INTO fake_claim_item (item_id, suspect_id, image_payload, user_id, status) VALUES (?, ?, ?, ?, ?)`,
      [foundId, userId, JSON.stringify(payload), foundItemUserId, "0"],
    );
    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Failed to create fake claim", status: 500 },
        { status: 500 },
      );
    }
    return NextResponse.json(
      {
        success: true,
        message: "Fake claim created successfully",
        status: 200,
      },
      { status: 200 },
    );
  } catch (error) {
    console.log("Error processing request: ", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", status: 500 },
      { status: 500 },
    );
  }
}
