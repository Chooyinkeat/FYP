"use server";
import { jwtDecode } from "jwt-decode";
import { NextResponse, NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
  const decoded: any = jwtDecode(token);
  const { correctAnswer, userAnswer } = await request.json();

  if (!correctAnswer || !userAnswer) {
    return NextResponse.json(
      { success: false, message: "Invalid request data" },
      { status: 400 },
    );
  }
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL!,
  });

  const combinedPrompt = `
    You are an answer verifier AI. You will be given a list of user answers and the correct answers for a quiz.

    For each entry, compare the user's answer with the correct answer. Return your evaluation as a JSON array of objects, where each object includes:
    - question
    - userAnswer
    - correctAnswer
    - evaluation: one of "Correct", "Partially correct", or "Incorrect"
    - explanation: a brief explanation

    Here is the data:

    ${userAnswer
      .map((userItem, idx) => {
        const correctItem = correctAnswer[idx];
        return `Q${idx + 1}:
    Question: ${userItem.question}
    Correct Answer: ${correctItem.correctAnswer}
    User's Answer: ${userItem.userInput}`;
      })
      .join("\n\n")}

    Now respond in the following format:

    1. JSON array of evaluation results:
    [
      {
        "question": "...",
        "userAnswer": "...",
        "correctAnswer": "...",
        "evaluation": "Correct" | "Partially correct" | "Incorrect",
        "explanation": "..."
      },
      ...
    ]

    2. JSON summary object on the next line (NOT in the array):
    {
      "Correct": <number>,
      "Partially correct": <number>,
      "Incorrect": <number>
    }
    `;

  try {
    const result = await model.generateContent(combinedPrompt);
    const response = await result.response;
    const text = response.text().trim();

    const splitIndex = text.lastIndexOf("]");
    let arrayText = text.slice(0, splitIndex + 1).trim();
    let summaryText = text.slice(splitIndex + 1).trim();
    arrayText = arrayText.replace(/^```json\s*|```$/g, "").trim();
    summaryText = summaryText.replace(/```(?:json)?/g, "").trim();

    let evaluationResults = [];
    let summaryResults = [];
    console.log("Summary results: ", summaryText);
    evaluationResults = JSON.parse(arrayText);
    const summaryMatch = summaryText.match(/{[\s\S]*}/); // looks for { ... } block
    if (summaryMatch) {
      summaryResults = JSON.parse(summaryMatch[0]);
    } else {
      throw new Error("No valid JSON found in summaryText");
    }

    return NextResponse.json(
      {
        status: 200,
        success: true,
        message: "Answers verified successfully",
        data: summaryResults,
        // fullEvaluation: evaluationResults,
      },
      { status: 200 },
    );
  } catch (error) {
    console.log("Gemini AI error: ", error);
    return NextResponse.json(
      { success: false, message: "AI verification failed" },
      { status: 500 },
    );
  }
}
