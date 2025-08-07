"use client";
import axios from "axios";
import React, { useState } from "react";
import Swal from "sweetalert2";
import Script from "next/script";
import { useSearchParams } from "next/navigation";
import UserProfile from "@/components/LostList/UserProfile";

const REASON_OPTIONS = ["Spam", "Scam or Fraud", "Other"];

const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

const handleSubmit = async (event, caseId: string) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const title = formData.get("title");
  const description = formData.get("description");
  const reason = formData.get("reason");
  const recaptchaResponse = formData.get("g-recaptcha-response");

  if (!recaptchaResponse) {
    Swal.fire({
      icon: "error",
      title: "reCAPTCHA Required",
      text: "Please complete the reCAPTCHA to submit your report.",
    });
    return;
  }

  try {
    const response = await axios.post("/api/protected/submitReport", {
      title,
      description,
      reason,
      caseId,
    });
    if (response.status !== 200) {
      throw new Error("Failed to submit report");
    }
    Swal.fire({
      icon: "success",
      title: "Report Submitted",
      text: "Thank you for helping us keep the community safe!",
    });

    // Reset the form
    event.target.reset();
  } catch (error) {
    console.error("Error submitting report:", error);
    Swal.fire({
      icon: "error",
      title: "Submission Failed",
      text: "There was an error submitting your report. Please try again later.",
    });
  }
};

const ReportForm = () => {
  const searchParams = useSearchParams();
  const suspectId = searchParams.get("suspectId");
  const claimId = searchParams.get("itemId");
  return (
    <>
      {/* ✅ reCAPTCHA script only for this page */}
      <Script
        src="https://www.google.com/recaptcha/api.js"
        strategy="afterInteractive"
        async
        defer
      />
      <div className="mx-auto flex w-full max-w-4xl flex-col items-start justify-center gap-8 md:flex-row">
        {/* Left: Report Form */}
        <div className="w-full md:w-1/2">
          <form
            className="flex flex-col gap-6 rounded-xl border border-gray-200 bg-white p-6 shadow-md"
            onSubmit={(event) => handleSubmit(event, claimId || "")}
          >
            {/* Header */}
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="rounded-full bg-red-100 p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Report User</h2>
              <p className="text-sm text-gray-500">
                Please fill out the form below to report inappropriate or
                suspicious behavior. All reports are confidential and help us
                keep the community safe.
              </p>
            </div>

            {/* Divider */}
            <div className="border-b border-gray-200" />

            {/* Fields */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="title" className="font-medium text-gray-700">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  placeholder="Enter a short title for your report"
                  className="rounded-lg border border-gray-300 p-3 transition focus:ring-2 focus:ring-red-400 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="description"
                  className="font-medium text-gray-700"
                >
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  placeholder="Describe the issue in detail..."
                  className="min-h-[100px] resize-none rounded-lg border border-gray-300 p-3 transition focus:ring-2 focus:ring-red-400 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="reason" className="font-medium text-gray-700">
                  Reason <span className="text-red-500">*</span>
                </label>
                <select
                  id="reason"
                  name="reason"
                  required
                  className="rounded-lg border border-gray-300 bg-white p-3 transition focus:ring-2 focus:ring-red-400 focus:outline-none"
                >
                  <option value="" disabled>
                    Select a reason
                  </option>
                  {REASON_OPTIONS.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col justify-center gap-1">
                <div className="g-recaptcha" data-sitekey={siteKey}></div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700 focus:ring-2 focus:ring-red-400 focus:outline-none disabled:opacity-60"
            >
              Submit Report
            </button>
          </form>
        </div>
        {/* Right: Animated Card + User Profile */}
        <div className="flex w-full flex-col gap-6 md:w-1/2">
          {/* User profile div */}
          {suspectId && <UserProfile userId={suspectId} className="w-full" />}
        </div>
      </div>
    </>
  );
};

export default ReportForm;
