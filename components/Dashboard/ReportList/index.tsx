"use client";
import axios from "axios";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Report } from "@/types/admin";

const getData = async () => {
  try {
    const response = await axios.get("/api/protected/getReportDetailsAPI", {
      withCredentials: true,
    });
    return response;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

const ReportList = () => {
  const [data, setData] = useState<Report[]>([]);

  useEffect(() => {
    getData().then((response) => {
      if (response?.status === 200) {
        setData(response.data.data);
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <h1 className="mb-8 text-2xl font-bold text-gray-800 md:text-3xl">
        Reports Management
      </h1>

      {data.length === 0 ? (
        <div className="flex h-60 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500">
          No reports available.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((report) => {
            const parsedImages = (() => {
              try {
                return JSON.parse(report.image_payload);
              } catch {
                return { userUploadImage: [], image_url_payload: [] };
              }
            })();

            return (
              <div
                key={report.report_id}
                className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg"
              >
                {/* Image Gallery */}
                {parsedImages.userUploadImage?.length > 0 && (
                  <div className="relative h-48 w-full overflow-hidden rounded-t-xl">
                    <Image
                      src={parsedImages.userUploadImage[0]}
                      alt="Main uploaded image"
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-gray-900">
                    {report.title}
                  </h3>
                  <p className="mb-4 line-clamp-3 text-sm text-gray-600">
                    {report.description}
                  </p>

                  {/* Reason Tag */}
                  <span className="mb-3 inline-block w-fit rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-600">
                    {report.reason}
                  </span>

                  {/* Additional Images */}
                  {parsedImages.userUploadImage?.length > 1 && (
                    <div className="mb-4 grid grid-cols-3 gap-2">
                      {parsedImages.userUploadImage
                        .slice(1)
                        .map((img: string, idx: number) => (
                          <div
                            key={idx}
                            className="relative h-20 w-full overflow-hidden rounded-md"
                          >
                            <Image
                              src={img}
                              alt={`Uploaded image ${idx + 1}`}
                              fill
                              className="object-cover transition-transform duration-300 hover:scale-105"
                            />
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Dates */}
                  <div className="mt-auto space-y-1 border-t border-gray-100 pt-3 text-xs text-gray-500">
                    <div>
                      Created:{" "}
                      {new Date(report.created_date).toLocaleString("en-MY", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </div>
                    <div>
                      Last Updated:{" "}
                      {new Date(report.last_updated_date).toLocaleString(
                        "en-MY",
                        { dateStyle: "medium", timeStyle: "short" },
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReportList;
