"use client";
import axios from "axios";
import Swal from "sweetalert2";
import { Props } from "@/types/question";
import React, { useState } from "react";

const ClaimQuestionForm: React.FC<Props> = ({
  questionPayload,
  userAnswers,
  setUserAnswers,
}) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let correctCount = 0;
    let totalQuestions = 0;
    const resultDetails: string[] = [];

    questionPayload.forEach((item, itemIdx) => {
      item.questions.forEach((q, qIdx) => {
        const correctAnswer = q.answer.trim().toLowerCase();
        const userAnswer = userAnswers[itemIdx]?.[qIdx]?.trim().toLowerCase();

        totalQuestions++;

        if (userAnswer === correctAnswer) {
          correctCount++;
          resultDetails.push(`✅ Q${qIdx + 1}: Correct`);
        } else {
          resultDetails.push(
            `❌ Q${qIdx + 1}: Your answer "${
              userAnswers[itemIdx]?.[qIdx] || ""
            }" is incorrect. "`,
          );
        }
      });
    });

    Swal.fire({
      icon: correctCount === totalQuestions ? "success" : "info",
      title:
        correctCount === totalQuestions ? "All correct!" : "Result Summary",
      html: `
        <p>You got <strong>${correctCount} / ${totalQuestions}</strong> correct.</p>
        <ul style="text-align: left; margin-top: 10px;">
          ${resultDetails.map((d) => `<li>${d}</li>`).join("")}
        </ul>
      `,
      confirmButtonText: "OK",
    }).then(() => {
      const clearedAnswers = questionPayload.map((item) =>
        item.questions.map(() => ""),
      );
      setUserAnswers(clearedAnswers);
    });
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
            {item.questions.map((q, qIdx) => (
              <div key={q.question}>
                <label className="mb-1 block font-medium text-gray-800 dark:text-gray-100">
                  {qIdx + 1}. {q.question}
                </label>
                <input
                  type="text"
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  value={userAnswers[itemIdx]?.[qIdx] || ""}
                  onChange={(e) => {
                    const newAnswers = [...userAnswers];
                    if (!newAnswers[itemIdx]) newAnswers[itemIdx] = [];
                    newAnswers[itemIdx][qIdx] = e.target.value;
                    setUserAnswers(newAnswers);
                  }}
                  required
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <button
        type="submit"
        className="w-full rounded-full bg-blue-600 px-8 py-3 font-semibold text-white shadow transition hover:bg-blue-700 md:w-auto dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        Submit Answers
      </button>
    </form>
  );
};

export default ClaimQuestionForm;
