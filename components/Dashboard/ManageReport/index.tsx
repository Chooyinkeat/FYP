"use client";
import axios from "axios";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Report } from "@/types/admin";
import { motion } from "framer-motion";
import {
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import Header from "@/components/Dashboard/ManageReport/Header";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

const getDetails = async (id: string | null) => {
  if (!id) return;

  try {
    const response = await axios.post(
      `/api/protected/getSingleReportAPI`,
      { reportId: id },
      { withCredentials: true },
    );
    return response.data;
  } catch (error) {
    console.log("Error updating appointment status:", error);
  }
};

const warningUser = async (
  id: number,
  type: string,
  suspectedId: number,
  fakeClaimId: number,
) => {
  try {
    const response = await axios.post(
      `/api/protected/warningUserAPI`,
      {
        reportId: id,
        type: type,
        suspectedId: suspectedId,
        fakeClaimId: fakeClaimId,
      },
      {
        withCredentials: true,
      },
    );
    return response.data;
  } catch (error) {
    console.log("Error updating report:", error);
  }
};

const restrictUser = async (
  id: number,
  type: string,
  suspectedId: number,
  fakeClaimId: number,
) => {
  try {
    const response = await axios.post(
      `/api/protected/restrictPostingAPI`,
      {
        reportId: id,
        type: type,
        suspectedId: suspectedId,
        fakeClaimId: fakeClaimId,
      },
      {
        withCredentials: true,
      },
    );
    return response.data;
  } catch (error) {
    console.log("Error updating report:", error);
  }
};

const banUser = async (
  id: number,
  type: string,
  suspectedId: number,
  fakeClaimId: number,
) => {
  try {
    const response = await axios.post(
      `/api/protected/updateReportStatusAPI`,
      {
        reportId: id,
        type: type,
        suspectedId: suspectedId,
        fakeClaimId: fakeClaimId,
      },
      {
        withCredentials: true,
      },
    );
    return response.data;
  } catch (error) {
    console.log("Error updating report:", error);
  }
};

const getStatusBadge = (status: number) => {
  switch (status) {
    case 0:
      return (
        <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
          <Clock className="mr-2 h-4 w-4" />
          Pending Review
        </span>
      );
    case 1:
      return (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
          <FileText className="mr-2 h-4 w-4" />
          Under Investigation
        </span>
      );
    case 2:
      return (
        <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
          <CheckCircle className="mr-2 h-4 w-4" />
          Resolved
        </span>
      );
    case 3:
      return (
        <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
          <AlertTriangle className="mr-2 h-4 w-4" />
          Rejected
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800">
          Unknown
        </span>
      );
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ManageReport = () => {
  const searchParams = useSearchParams();
  const reportId = searchParams.get("id");
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [imagePayload, setImagePayload] = useState<{
    userUploadImage: string[];
    image_url_payload: string[];
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!reportId) {
      console.log("No reportId provided, setting loading to false");
      setLoading(false);
      return;
    }
    getDetails(reportId)
      .then((response) => {
        if (response.status === 200) {
          setReport(response.data[0]);
          console.log("Report Details: ", response.data[0]);
          setLoading(false);

          try {
            const parsedPayload = JSON.parse(response.data[0].image_payload);
            setImagePayload({
              userUploadImage: parsedPayload.userUploadImage || [],
              image_url_payload: parsedPayload.originalImages?.[0]
                ?.image_url_payload
                ? JSON.parse(parsedPayload.originalImages[0].image_url_payload)
                : [],
            });
          } catch (err) {
            console.log("Failed to parse image_payload:", err);
            setImagePayload(null);
          }
        }
      })
      .catch((error) => {
        console.log("Error fetching report details:", error);
        setLoading(false);
      });
  }, [reportId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        {" "}
        <div className="text-center">
          {" "}
          <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-red-500" />{" "}
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            {" "}
            Report Not Found{" "}
          </h2>{" "}
          <p className="text-gray-600">
            {" "}
            The requested report could not be found.{" "}
          </p>{" "}
          <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            {" "}
            <p className="text-sm text-yellow-800">
              {" "}
              <strong>Debug Info:</strong> reportId: {reportId}, loading:{" "}
              {loading.toString()}{" "}
            </p>{" "}
          </div>{" "}
        </div>{" "}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <h1 className="mb-2 text-3xl font-bold text-gray-900">
                Title : {report.title}
              </h1>
            </div>
            <div className="mt-4 lg:mt-0">{getStatusBadge(report.status)}</div>
          </div>
          <Header
            reporterId={report.user_id?.toString() || ""}
            suspectId={report.suspect_id?.toString() || ""}
            caseId={report.case_id?.toString() || ""}
          />
        </motion.div>

        {/* Images part */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-900">
            <ImageIcon className="mr-3 h-6 w-6 text-blue-600" />
            Image Evidence
          </h2>

          {imagePayload ? (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div>
                <h3 className="mb-4 text-center text-lg font-semibold text-gray-900 lg:text-left">
                  User Upload Images (Evidence)
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {imagePayload.userUploadImage.map((image, index) => (
                    <div key={index} className="group relative">
                      <Image
                        src={image}
                        alt={`User upload ${index + 1}`}
                        width={300}
                        height={300}
                        className="h-48 w-full cursor-pointer rounded-lg border-2 border-blue-200 object-cover transition-colors hover:border-blue-400"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-center text-lg font-semibold text-gray-900 lg:text-left">
                  Original Item Images
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {imagePayload.image_url_payload.map((image, index) => (
                    <div key={index} className="group relative">
                      <Image
                        src={image}
                        alt={`Original item ${index + 1}`}
                        width={300}
                        height={300}
                        className="h-48 w-full cursor-pointer rounded-lg border-2 border-green-200 object-cover transition-colors hover:border-green-400"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <ImageIcon className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                No Images Available
              </h3>
              <p className="text-gray-500">
                The image evidence for this report is not available or could not
                be loaded.
              </p>
              <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Debug Info:</strong> Check the console for more
                  details about the image payload.
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Report details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-900">
            <FileText className="mr-3 h-6 w-6 text-blue-600" />
            Report Details
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Reason for Report
                </label>
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                  <span className="font-medium text-red-800">
                    {report.reason}
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Title:
                </label>
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                  <span className="font-medium text-gray-800">
                    {report.title}
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Description:
                </label>
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                  <span className="font-medium text-gray-800">
                    {report.description}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Created Date
                </label>
                <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                  <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                  <span className="text-gray-800">
                    {formatDate(report.created_date)}
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Last Updated
                </label>
                <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                  <Clock className="mr-2 h-4 w-4 text-gray-400" />
                  <span className="text-gray-800">
                    {formatDate(report.last_updated_date)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Admin action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Admin Actions
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Warn User */}
            <button
              className="cursor-pointer rounded-lg bg-yellow-600 px-6 py-3 font-medium text-white transition-colors hover:bg-yellow-700 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:outline-none"
              onClick={() =>
                warningUser(
                  report.report_id,
                  "warning",
                  report.suspect_id,
                  report.fake_claim_id,
                ).then((response) => {
                  if (response.status === 200) {
                    Swal.fire(
                      "Success",
                      "Warning message sent successfully.",
                      "success",
                    );
                    router.push("/dashboard");
                  }
                })
              }
            >
              Send Warning
            </button>

            {/* Disable user to post */}
            <button
              className="cursor-pointer rounded-lg bg-orange-600 px-6 py-3 font-medium text-white transition-colors hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:outline-none"
              onClick={() =>
                restrictUser(
                  report.report_id,
                  "restrict",
                  report.suspect_id,
                  report.fake_claim_id,
                ).then((response) => {
                  if (response.status === 200) {
                    Swal.fire(
                      "Success",
                      "The suspected user has been restrcted posting.",
                      "success",
                    );
                    router.push("/dashboard");
                  }
                })
              }
            >
              Restrict Posting
            </button>

            {/* Ban User */}
            <button
              className="cursor-pointer rounded-lg bg-red-600 px-6 py-3 font-medium text-white transition-colors hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
              onClick={() =>
                banUser(
                  report.report_id,
                  "ban",
                  report.suspect_id,
                  report.fake_claim_id,
                ).then((response) => {
                  if (response.status === 200) {
                    Swal.fire(
                      "Banned",
                      "The suspected user account has been banned.",
                      "success",
                    );
                    router.push("/dashboard");
                  }
                })
              }
            >
              Ban Suspected User Account
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ManageReport;
