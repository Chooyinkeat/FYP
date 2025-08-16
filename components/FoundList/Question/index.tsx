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
    <div className="overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-gray-800 dark:shadow-2xl">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white dark:from-blue-700 dark:to-blue-800">
        <h2 className="text-xl font-bold sm:text-2xl">
          🔐 Ownership Verification Questions
        </h2>
        <p className="mt-1 text-blue-100 dark:text-blue-200">
          Answer the following questions to prove ownership of this item
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8">
        <div className="space-y-8">
          {questionPayload.map((item, itemIdx) => (
            <div
              key={item.filename}
              className="overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6 shadow-lg dark:border-gray-700 dark:from-blue-900/20 dark:to-blue-800/20"
            >
              <div className="mb-6 flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white dark:bg-blue-500">
                  <i className="fa fa-file-text"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                    Question Set #{itemIdx + 1}
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {item.filename}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {Object.entries(item.questions).map(([levelKey, questions]) => (
                  <div key={levelKey} className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center rounded-full bg-blue-200 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-700 dark:text-blue-200">
                        {levelKey.toUpperCase()} Level
                      </span>
                    </div>
                    
                    <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                      {questions.map((q, qIdx) => (
                        <div
                          key={`${levelKey}-${qIdx}`}
                          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-600 dark:bg-gray-800"
                        >
                          <label className="mb-3 block">
                            <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                                {qIdx + 1}
                              </span>
                              {q.question}
                            </span>
                            <input
                              type="text"
                              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
                              value={userAnswers[itemIdx]?.[`${levelKey}-${qIdx}`] || ""}
                              onChange={(e) => {
                                const newAnswers = [...userAnswers];
                                if (!newAnswers[itemIdx]) newAnswers[itemIdx] = {};
                                newAnswers[itemIdx][`${levelKey}-${qIdx}`] =
                                  e.target.value;
                                setUserAnswers(newAnswers);
                              }}
                              placeholder="Enter your answer..."
                              required
                            />
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Submit Button */}
        <div className="mt-8 flex justify-center">
          <button
            type="submit"
            className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-green-600 to-green-700 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:from-green-700 hover:to-green-800 hover:shadow-xl focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none dark:from-green-500 dark:to-green-600 dark:hover:from-green-600 dark:hover:to-green-700"
          >
            <i className="fa fa-check-circle text-lg"></i>
            Submit Answers for Verification
            <svg
              className="fill-white"
              width="16"
              height="16"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10.4767 6.16664L6.00668 1.69664L7.18501 0.518311L13.6667 6.99998L7.18501 13.4816L6.00668 12.3033L10.4767 7.83331H0.333344V6.16664H10.4767Z"
                fill=""
              />
            </svg>
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-6 rounded-lg bg-blue-50 p-4 text-center dark:bg-blue-900/20">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <i className="fa fa-info-circle mr-2"></i>
            All questions must be answered correctly to prove ownership. Partial answers may not be sufficient.
          </p>
        </div>
      </form>
    </div>
  );
};

export default ClaimQuestionForm;
