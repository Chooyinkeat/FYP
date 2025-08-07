"use client";
import React from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Props } from "@/types/question";
import { AnswerInput, AnswerCorrect } from "@/types/verifyAnswer";

const verifyAnswer = async (
  correctAnswer: Array<AnswerCorrect>,
  userAnswers: Array<AnswerInput>,
) => {
  try {
    const response = await axios.post(
      "/api/protected/verifyAnswer",
      {
        correctAnswer: correctAnswer,
        userAnswer: userAnswers,
      },
      { withCredentials: true },
    );
    return response.data;
  } catch (error) {
    console.log("Error verifying answers:", error);
  }
};

const notifyFounder = async (userId: string, results: string) => {
  try {
    const response = await axios.post(
      "/api/protected/notifyUserAPI/notifyFounderAPI",
      { userId: userId, results: results },
      { withCredentials: true },
    );
    return response.data;
  } catch (error) {
    console.error("Error notifying founder:", error);
  }
};

const ClaimQuestionForm: React.FC<Props> = ({
  questionPayload,
  userAnswers,
  setUserAnswers,
  userId,
}) => {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const userInputs = questionPayload.flatMap((item, itemIdx) =>
      Object.entries(item.questions).flatMap(([levelKey, questions]) =>
        questions.map((q, qIdx) => ({
          question: q.question,
          userInput: userAnswers[itemIdx]?.[`${levelKey}-${qIdx}`] || "",
        })),
      ),
    );
    const correctAnswers = questionPayload.flatMap((item) =>
      Object.entries(item.questions).flatMap(([levelKey, questions]) =>
        questions.map((q) => ({
          question: q.question,
          correctAnswer: q.answer,
        })),
      ),
    );

    const response = await verifyAnswer(correctAnswers, userInputs);
    if (response?.success) {
      Swal.fire({
        title: "Verification Summary",
        html: `
            <p><strong>Correct:</strong> ${response.data.Correct}</p>
            <p><strong>Partially correct:</strong> ${response.data["Partially correct"]}</p>
            <p><strong>Incorrect:</strong> ${response.data.Incorrect}</p>
          `,
        icon: "info",
        confirmButtonText: "OK",
      }).then(async (result) => {
        if (result.isConfirmed) {
          setUserAnswers([]);
          if (
            userId &&
            response.data["Correct"] > 0 &&
            response.data["Partially correct"] === 0 &&
            response.data["Incorrect"] === 0
          ) {
            const result = await notifyFounder(
              userId,
              JSON.stringify(response.data),
            );
            if (result.status === 200) {
              Swal.fire({
                title: "Notification Sent",
                text: "The founder has been notified successfully.",
                icon: "success",
                confirmButtonText: "OK",
              });
            } else {
              console.log("Failed to notify founder:", result.message);
            }
          }
        }
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-8 max-w-3xl space-y-8 rounded-xl bg-white p-6 shadow dark:bg-gray-900"
    >
      <h2 className="mb-4 text-2xl font-bold text-blue-700 dark:text-blue-300">
        Answer the following questions to claim this item
      </h2>
      {questionPayload.map((item, itemIdx) => (
        <div
          key={item.filename}
          className="mb-6 rounded-lg border bg-blue-50 p-4 dark:bg-blue-900/20"
        >
          <h3 className="mb-2 font-semibold text-blue-700 dark:text-blue-300">
            Questions:
          </h3>
          <div className="space-y-4">
            {Object.entries(item.questions).map(([levelKey, questions]) =>
              questions.map((q, qIdx) => (
                <div key={`${levelKey}-${qIdx}`}>
                  <label className="mb-1 block font-medium text-gray-800 dark:text-gray-100">
                    {qIdx + 1}. ({levelKey}) {q.question}
                  </label>
                  <input
                    type="text"
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    value={userAnswers[itemIdx]?.[`${levelKey}-${qIdx}`] || ""}
                    onChange={(e) => {
                      const newAnswers = [...userAnswers];
                      if (!newAnswers[itemIdx]) newAnswers[itemIdx] = {};
                      newAnswers[itemIdx][`${levelKey}-${qIdx}`] =
                        e.target.value;
                      setUserAnswers(newAnswers);
                    }}
                    required
                  />
                </div>
              )),
            )}
          </div>
        </div>
      ))}

      <button
        type="submit"
        className="w-full cursor-pointer rounded-full bg-blue-600 px-8 py-3 font-semibold text-white shadow transition hover:bg-blue-700 md:w-auto dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        Submit Answers
      </button>
    </form>
  );
};

export default ClaimQuestionForm;
