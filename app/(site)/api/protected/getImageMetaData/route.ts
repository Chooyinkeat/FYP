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

async function analyzeImageWithGemini(images: File[]) {
  const parts: any[] = [];

  parts.push({
    text: `
You will be provided with ${images.length} images. For each image, analyze it individually and return structured metadata and two levels of verification questions in the following valid JSON format:

[
  {
    "filename": "image1.jpg",
    "category": "Laptop",
    "metadata": {
      "item_type": "Dell XPS 13",
      "color": "Silver",
      "brand": "Dell",
      "material": "Aluminum"
    },
    "questions": {
      "level_1": [
        { "question": "What brand is this laptop?", "answer": "Dell" },
        { "question": "What is the color of the laptop?", "answer": "Silver" }
      ],
      "level_2": [
        { "question": "Does the laptop show any visible scratches?", "answer": "No scratches are visible." },
        { "question": "Is the laptop powered on or off?", "answer": "It appears to be powered off." }
      ]
    }
  }
]

### Category rules:
- If the image is of a **laptop**, always set "category": "Laptop".
- If the image is of a **mobile phone**, always set "category": "Mobile Phone".
- If the image is of a **tablet**, always set "category": "Tablet".
- If the image is of an **ID card** (driver’s license, passport, student ID, etc.), always set "category": "ID Card".
- Otherwise, use a general category such as "Clothing", "Accessory", "Electronics", "Document", etc.

### Additional guidelines:
- Do not use '...' anywhere in the output.
- Do not add trailing commas.
- Do not wrap the result in \`\`\`json or \`\`\`.
- Only output a raw JSON array as shown above, and nothing else.
- Ensure the final result is strictly valid JSON that can be parsed using JSON.parse().
- Always use real values based on the image, and avoid placeholder text like "e.g.".
- Always include the correct "filename" for each image.
`,
  });

  for (const image of images) {
    const arrayBuffer = await image.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    parts.push({
      inlineData: {
        data: base64,
        mimeType: image.type || "image/jpeg",
      },
    });
  }

  const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL! });
  const result = await model.generateContent(parts);

  let text = await result.response.text();
  if (text.startsWith("```json")) {
    text = text.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    console.log("Gemini response parse error:", text);
    return [];
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

  // Only allow up to 5 images
  if (images.length > 5) {
    return NextResponse.json(
      { success: false, message: "You can only upload up to 5 images" },
      { status: 400 },
    );
  }

  const aiResults = await analyzeImageWithGemini(images);
  const imageSummaries = images.map((image) => ({
    name: image.name,
    type: image.type,
    size: image.size,
  }));

  return NextResponse.json({
    status: 200,
    success: true,
    message: "AI metadata generated successfully",
    data: aiResults,
    images: imageSummaries,
  });
}
