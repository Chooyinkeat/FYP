"use server";
import { Queue } from "bullmq";
import cloudinary from "@/lib/cloudinary";
import connection from "@/lib/redis";
import { jwtDecode } from "jwt-decode";
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
export async function POST(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const decoded: any = jwtDecode(token);
  const emailQueue = new Queue("exampleQueue", { connection });
  const formData = await request.formData();
  const userId = formData.get("userId") as string;
  const images = formData.getAll("userImages") as File[];
  console.log("User ID: ", userId);
  console.log("Images: ", images);
  if (!userId || images.length === 0) {
    return NextResponse.json(
      { success: false, message: "Id is required" },
      { status: 400 },
    );
  }

  try {
    const imageUrls: string[] = [];

    const [rows] = await pool.query(
      "SELECT email FROM user WHERE user_id = ? LIMIT 1",
      [userId],
    );

    if ((rows as any[]).length === 0) {
      return NextResponse.json({
        success: false,
        message: "No result found for this email",
        status: 404,
      });
    }

    if (images.length !== 0) {
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
    await emailQueue.add(
      "sendEmail",
      { email: (rows as any[])[0].email, images: imageUrls },
      {
        removeOnFail: {
          age: 60,
        },
      },
    );
  } catch (error) {
    console.error("Error processing email notification:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process email notification" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { success: true, message: "Notification sent successfully" },
    { status: 200 },
  );
}
