"use server";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import cloudinary from "@/lib/cloudinary";

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
  const imageUrls = JSON.parse(rawUrls[0]);

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
    score: number;
    userImageUrl?: File;
    lostImageUrl?: string;
  }[] = [];

  let totalScore = 0;
  let count = 0;

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

      const match =
        response.match(/(\d{1,3})\s*\/\s*100/) ||
        response.match(/\*\*(\d{1,3})\*\*/) ||
        response.match(/(\d{1,3})\s*percent/i) ||
        response.match(/(\d{1,3})/);

      const numericScore = match ? Math.min(parseInt(match[1]), 100) : 0;

      if (numericScore > 0) {
        // 💡 only count valid scores
        totalScore += numericScore;
        count++;
      }

      results.push({
        userImageIndex: i,
        lostImageIndex: j,
        similarityScore: response,
        score: numericScore,
        userImageUrl: userUploadImages[i],
        lostImageUrl: imageUrls[j],
      });
    }
  }

  const averageScore = count > 0 ? totalScore / count : 0;
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
    data: results,
    averageScore,
    status: 200,
    urls: urls.map((url: any) => url.secure_url),
  });
}
