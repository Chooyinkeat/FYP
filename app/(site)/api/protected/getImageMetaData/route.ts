"use server";

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GOOGLE_GEMINI_API_KEY) {
  throw new Error("Missing GOOGLE_API_KEY environment variable");
}
if (!process.env.GEMINI_MODEL) {
  throw new Error("Missing GEMINI_MODEL environment variable");
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

async function analyzeImageWithGemini(image: File) {
  const arrayBuffer = await image.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");

  const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL! });

  const result = await model.generateContent([
    `Analyze this image and return metadata and 3 verification questions:\n\nFormat:\n{
      "category": "...",
      "metadata": {
        "item_type": "...",
        "color": "...",
        "brand": "...",
        "material": "...",
        "condition": "..."
      },
      "questions": [
        {"question": "...", "answer": "..."},
        {"question": "...", "answer": "..."},
        {"question": "...", "answer": "..."}
      ]
    }`,
    {
      inlineData: {
        data: base64,
        mimeType: image.type || "image/jpeg",
      },
    },
  ]);

  let text = await result.response.text();

  if (text.startsWith("```json")) {
    text = text.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    console.log("Gemini response parse error:", text);
    return {
      metadata: {},
      questions: [],
    };
  }
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const formData = await request.formData();
  const images = formData.getAll("images") as File[];

  if (images.length === 0) {
    return NextResponse.json(
      { success: false, message: "No images provided" },
      { status: 400 },
    );
  }

  const results: any[] = [];

  for (const image of images) {
    const aiData = await analyzeImageWithGemini(image);
    results.push({
      filename: image.name,
      metadata: aiData.metadata || {},
      questions: aiData.questions || [],
    });
  }

  return NextResponse.json({
    success: true,
    message: "AI metadata generated successfully",
    data: results,
  });
}
