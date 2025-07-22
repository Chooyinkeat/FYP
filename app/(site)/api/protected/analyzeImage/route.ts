"use server";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, Part } from "@google/generative-ai";

if (!process.env.GOOGLE_GEMINI_API_KEY) {
  throw new Error("Missing GOOGLE_API_KEY environment variable");
}
if (!process.env.GEMINI_MODEL) {
  throw new Error("Missing GEMINI_MODEL environment variable");
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const formData = await request.formData();
  const userUploadImages = formData.getAll("userImages") as File[];
  const rawUrls = formData.getAll("imageUrl") as string[];
  const imageUrls = JSON.parse(rawUrls[0]); // Now it's a string[]

  if (userUploadImages.length === 0 || imageUrls.length === 0) {
    return NextResponse.json(
      { success: false, message: "No images provided" },
      { status: 400 },
    );
  }

  const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL! });

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

  // Convert all files and URLs
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
          text: "How visually similar are these two images on a scale from 0 to 100?",
        },
      ];

      const result = await model.generateContent({
        contents: [{ role: "user", parts: promptParts }],
      });

      const response = result.response.text();
      results.push({
        userImageIndex: i,
        lostImageIndex: j,
        similarityScore: response,
      });
    }
  }

  return NextResponse.json({ success: true, data: results, status: 200 });
}
