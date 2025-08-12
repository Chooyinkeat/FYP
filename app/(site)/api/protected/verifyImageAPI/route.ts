"use server";
import pool from "@/lib/db";
import { NextResponse, NextRequest } from "next/server";
import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import cloudinary from "@/lib/cloudinary";

if (!process.env.GOOGLE_GEMINI_API_KEY) {
  throw new Error("Missing GOOGLE_API_KEY environment variable");
}
if (!process.env.GEMINI_MODEL) {
  throw new Error("Missing GEMINI_MODEL environment variable");
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
// Convert uploaded File objects to base64
const convertFileToBase64 = async (file: File): Promise<string> => {
  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || "image/jpeg";
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
};

// Convert Cloudinary image URLs to base64
const convertUrlToBase64 = async (url: string): Promise<string> => {
  const res = await fetch(url);
  const mimeType = res.headers.get("content-type") || "image/jpeg";
  const arrayBuffer = await res.arrayBuffer();
  return `data:${mimeType};base64,${Buffer.from(arrayBuffer).toString(
    "base64",
  )}`;
};

export async function POST(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const formData = await request.formData();
  const userUploadImages = formData.getAll("images") as File[];
  const foundId = formData.get("foundId") as string;

  if (userUploadImages.length === 0 || !foundId) {
    return NextResponse.json(
      { success: false, message: "No images or foundId provided" },
      { status: 400 },
    );
  }

  const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL! });

  try {
    const [rows] = await pool.query(
      "SELECT image_url_payload FROM found_item WHERE found_id = ? LIMIT 1",
      [foundId],
    );

    if ((rows as any[]).length === 0) {
      return NextResponse.json(
        { success: false, message: "Found item not found" },
        { status: 404 },
      );
    }
    const imageUrlPayloadString = (rows as any[])[0].image_url_payload;
    const imageUrls = JSON.parse(imageUrlPayloadString) as string[];
    if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json(
        { success: false, message: "No image URLs found" },
        { status: 404 },
      );
    }
    const base64UserImages = await Promise.all(
      userUploadImages.map(convertFileToBase64),
    );
    const base64Images = await Promise.all(
      imageUrls.map(async (url: string) => await convertUrlToBase64(url)),
    );
    const results: {
      userImageIndex: number;
      lostImageIndex: number;
      similarityScore: string;
      numericScore: number;
    }[] = [];

    for (let i = 0; i < base64UserImages.length; i++) {
      for (let j = 0; j < base64Images.length; j++) {
        const promptParts: Part[] = [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64UserImages[i].split(",")[1],
            },
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Images[j].split(",")[1],
            },
          },
          {
            text: `
              Compare these two images and respond with:

              Explanation: <brief explanation of visual similarity>
              Similarity Score: <number between 0 and 100>

              Only provide these two lines in your response.
        `,
          },
        ];

        const result = await model.generateContent({
          contents: [{ role: "user", parts: promptParts }],
        });

        const response = await result.response.text();

        const scoreMatch = response.match(/Similarity Score:\s*(\d+(\.\d+)?)/i);
        const numericScore = scoreMatch ? parseFloat(scoreMatch[1]) : 0;

        results.push({
          userImageIndex: i,
          lostImageIndex: j,
          similarityScore: response, // includes explanation + score
          numericScore,
        });
      }
    }

    const totalScore = results.reduce(
      (sum, item) => sum + item.numericScore,
      0,
    );
    const averageScore = results.length > 0 ? totalScore / results.length : 0;

    const simplifiedResults = results.map(
      ({ userImageIndex, lostImageIndex, similarityScore }) => ({
        userImageIndex,
        lostImageIndex,
        similarityScore,
      }),
    );
    let urls: any[] = [];
    if (averageScore >= 80) {
      // Pass all the userUploadImage to cloudinary
      urls = await Promise.all(
        base64UserImages.map((base64Image) =>
          cloudinary.uploader.upload(
            `data:image/jpeg;base64,${base64Image.split(",")[1]}`,
          ),
        ),
      );
    }

    return NextResponse.json({
      success: true,
      status: 200,
      data: simplifiedResults,
      averageScore: parseFloat(averageScore.toFixed(2)), // include average
      message: "Image analysis and comparison completed",
      urls: urls.map((url: any) => url.secure_url),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
