"use client";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { useSearchParams } from "next/navigation";
import UserProfile from "@/components/LostList/UserProfile";
import ItemLocation from "@/components/LostList/ItemLocation";
import ClaimQuestionForm from "@/components/FoundList/Question";
import React, { useCallback, useState, useEffect } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
const updateItemStatus = async (id: string) => {
  try {
    const response = await axios.post(
      "/api/protected/updateItemStatusAPI",
      { itemId: id, type: "found" },
      { withCredentials: true },
    );
    return response.data;
  } catch (error) {
    console.log("Error updating item status:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to update item status.",
    });
  }
};

const FoundItemDetails = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const foundId = searchParams.get("foundId");
  const location = searchParams.get("location");
  const date = searchParams.get("date");
  const time = searchParams.get("time");
  const category = searchParams.get("category");
  const userId = searchParams.get("userId");
  const show_img = searchParams.get("show_img");
  const imageUrl = searchParams.get("image_url");
  // ✅ Parse imageUrl safely into an array
  const parsedImages: string[] = React.useMemo(() => {
    if (!imageUrl) return [];
    try {
      return JSON.parse(decodeURIComponent(imageUrl));
    } catch (err) {
      console.error("Error parsing image_url:", err);
      return [];
    }
  }, [imageUrl]);

  const [files, setFiles] = useState<File[]>([]);
  const [questionPayload, setQuestionPayload] = useState<any[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>[]>([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    console.log("Show img: ", show_img);
    const urlUserId = searchParams.get("userId");
    const sessionUserId = sessionStorage.getItem("userId");

    if (urlUserId && sessionUserId && urlUserId === sessionUserId) {
      setShow(true);
    }
  }, [searchParams]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (files.length + acceptedFiles.length > 5) {
        Swal.fire({
          icon: "error",
          title: "Upload limit exceeded",
          text: "You can only upload up to 5 images.",
        });
        return;
      }
      // ✅ Update the state with new files
      setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
    },
    [files],
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
    multiple: true,
  });
  const removeFile = (name: string) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== name));
  };

  const verifyFoundItem = async (e: React.FormEvent, userId, location) => {
    e.preventDefault();
    const formData = new FormData();

    if (files.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Files Selected",
        text: "Please upload an image to verify the found item.",
      });
      return;
    }

    files.forEach((file) => {
      formData.append("images", file);
    });
    formData.append("foundId", foundId ?? "");
    Swal.fire({
      title: "Analyzing Image...",
      text: "Please wait while the AI processes your image.",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    try {
      const response = await axios.post(
        `/api/protected/verifyImageAPI`,
        formData,
        { withCredentials: true },
      );
      if (response.data.status == 200) {
        if (response.data.averageScore >= 80) {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Your images are highly similar (above 80%) to the found item. The founder has been notified.",
          }).then(() => {
            setFiles([]);

            router.push(
              `/appointment?userId=${encodeURIComponent(
                userId ?? "",
              )}&urls=${encodeURIComponent(
                JSON.stringify(response.data.urls),
              )}&caseId=${encodeURIComponent(foundId ?? "")}`,
            );
          });
        } else {
          formData.append("foundItemUserId", userId ?? "");
          try {
            const response = await axios.post(
              "/api/protected/fakeClaimAPI",
              formData,
              {
                withCredentials: true,
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              },
            );
            console.log("Fake claim response: ", response);
            if (response.status === 200) {
              Swal.fire({
                icon: "warning",
                title: "Error",
                text: "The uploaded images are not found item.",
                confirmButtonText: "OK",
              });
            }
          } catch (error) {
            console.log("Error in fake claim API:", error);
          }
          setFiles([]);
        }
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to verify found item.",
      });
    }
  };

  const getQuestionPayload = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `/api/protected/getQuestionPayloadAPI`,
        { foundId: foundId },
        { withCredentials: true },
      );
      setQuestionPayload(response.data.data);
      if (response.data.data && response.data.data[0]?.questionPayload) {
        setUserAnswers(
          response.data.data[0].questionPayload.map((item: any) => {
            const allQuestions = Object.values(item.questions).flat();
            return allQuestions.map(() => "");
          }),
        );
      }
    } catch (error) {
      console.log("Error fetching question payload:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to retrieve question payload.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-7xl">
        {/* Enhanced Header Section */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl dark:text-white">
            Found Item Details
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Review and claim your found item
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content - Enhanced */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-gray-800 dark:shadow-2xl">
              <div className="p-6 sm:p-8">
                {/* Header with Close Case Button */}
                <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
                      Found Item Case
                    </h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                      Case ID: {foundId}
                    </p>
                  </div>
                  {show && (
                    <button
                      type="button"
                      onClick={() => {
                        Swal.fire({
                          title: "Are you sure?",
                          text: "This will close the case and remove it from the list.",
                          icon: "warning",
                          showCancelButton: true,
                          confirmButtonText: "Yes, close it!",
                          cancelButtonText: "No, keep it open",
                        }).then((result) => {
                          if (result.isConfirmed) {
                            if (foundId) {
                              updateItemStatus(foundId).then((data) => {
                                if (data?.success) {
                                  Swal.fire({
                                    icon: "success",
                                    title: "Success",
                                    text: "Item status updated successfully.",
                                  }).then(() => {
                                    window.location.href = "/foundItems";
                                  });
                                }
                              });
                            }
                          }
                        });
                      }}
                      className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:bg-red-700 hover:shadow-xl focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:outline-none dark:bg-red-500 dark:hover:bg-red-600"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Close Case
                    </button>
                  )}
                </div>
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <Swiper
                    pagination={{ clickable: true }}
                    className="h-full w-full cursor-pointer"
                  >
                    {(show_img === "1" && parsedImages.length > 0
                      ? parsedImages
                      : ["/images/blog/img_1.webp"]
                    ).map((imgUrl, i) => (
                      <SwiperSlide key={i}>
                        <Image
                          src={imgUrl}
                          alt={`Found item ${i + 1}`}
                          fill
                          className="object-cover"
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
                {/* Enhanced Item Details */}
                <div className="mb-8 rounded-xl bg-gray-50 p-6 dark:bg-gray-700">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    📋 Item Information
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                          <i className="fa fa-tag text-blue-600 dark:text-blue-400"></i>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Category
                          </p>
                          <p className="text-gray-900 dark:text-white">
                            {category || "Unknown Category"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                          <i className="fa fa-calendar text-green-600 dark:text-green-400"></i>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Date
                          </p>
                          <p className="text-gray-900 dark:text-white">
                            {date || "Unknown Date"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                          <i className="fa fa-clock text-purple-600 dark:text-purple-400"></i>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Time
                          </p>
                          <p className="text-gray-900 dark:text-white">
                            {time || "Unknown Time"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                          <i className="fa fa-map-marker text-orange-600 dark:text-orange-400"></i>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Location
                          </p>
                          <p className="text-gray-900 dark:text-white">
                            {location || "Unknown Location"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Map Section */}
                <div className="mb-8">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    📍 Item Location
                  </h3>
                  <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-600">
                    <ItemLocation location={location || "Unknown Location"} />
                  </div>
                </div>

                {/* Enhanced Image Upload Section */}
                {/* Conditional Rendering */}
                {show_img === "0" && !show ? (
                  // 🔹 Enhanced Image Upload Section
                  <div className="space-y-6">
                    <div className="rounded-xl bg-blue-50 p-6 dark:bg-blue-900/20">
                      <h3 className="mb-4 text-lg font-semibold text-blue-900 dark:text-blue-100">
                        🔍 Image Verification
                      </h3>
                      <p className="mb-4 text-sm text-blue-800 dark:text-blue-200">
                        Upload images if you have found the item to verify
                        ownership:
                      </p>

                      <form method="POST" className="mx-auto w-full max-w-2xl">
                        {/* Dropzone */}
                        <div
                          {...getRootProps()}
                          className={`mb-6 flex min-h-48 flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-400 sm:min-h-56 ${
                            isDragActive
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                              : "border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800"
                          } p-8 text-center`}
                          tabIndex={0}
                        >
                          <input {...getInputProps()} />

                          {files.length > 0 ? (
                            <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                              {files.map((file, idx) => (
                                <div
                                  key={idx}
                                  className="group relative flex flex-col items-center gap-2 rounded-lg bg-white p-3 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-900"
                                >
                                  <button
                                    onClick={() => removeFile(file.name)}
                                    className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white shadow-lg transition-all duration-200 hover:scale-110 hover:bg-red-600 focus:ring-2 focus:ring-red-300 focus:outline-none"
                                    title="Remove"
                                    type="button"
                                  >
                                    ✕
                                  </button>
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt="Preview"
                                    className="h-20 w-20 rounded-lg object-cover shadow-md transition-transform duration-300 group-hover:scale-105"
                                  />
                                  <p className="max-w-[80px] truncate text-center text-xs font-medium text-gray-700 dark:text-gray-300">
                                    {file.name}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : isDragActive ? (
                            <div className="space-y-2">
                              <div className="text-4xl">📁</div>
                              <p className="text-lg font-medium text-blue-600 dark:text-blue-400">
                                Drop your images here...
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="text-4xl">📤</div>
                              <p className="text-sm text-gray-600 sm:text-base dark:text-gray-400">
                                Drag & drop up to 5 image files, or{" "}
                                <span className="cursor-pointer font-medium text-blue-600 underline transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                  click to select
                                </span>
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500">
                                Supported formats: JPG, PNG, GIF, WEBP
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                          <button
                            type="submit"
                            onClick={(e) =>
                              verifyFoundItem(e, userId, location)
                            }
                            aria-label="verify found item"
                            className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:outline-none sm:w-auto dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700"
                          >
                            <i className="fa fa-check-circle text-lg"></i>
                            Verify with Images
                          </button>

                          <button
                            type="button"
                            onClick={getQuestionPayload}
                            className="inline-flex w-full items-center justify-center gap-3 rounded-xl border-2 border-blue-600 bg-white px-8 py-4 font-semibold text-blue-600 shadow-lg transition-all duration-300 hover:bg-blue-50 hover:shadow-xl focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:outline-none sm:w-auto dark:bg-transparent dark:text-blue-400 dark:hover:bg-blue-900/20"
                          >
                            <i className="fa fa-question-circle text-lg"></i>
                            Get Questions
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                ) : (
                  // 🔹 Make Appointment Button
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        router.push(
                          `/appointment?userId=${encodeURIComponent(
                            userId ?? "",
                          )}&urls=${encodeURIComponent(
                            JSON.stringify(parsedImages),
                          )}&caseId=${encodeURIComponent(foundId ?? "")}`,
                        );
                      }}
                      className="cursor-pointer rounded-xl bg-green-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:bg-green-700 hover:shadow-xl focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:outline-none"
                    >
                      📅 Make Appointment
                    </button>
                  </div>
                )}

                {/* Enhanced Question Form */}
                {questionPayload.length > 0 &&
                  questionPayload[0]?.questionPayload && (
                    <div className="mt-8">
                      <ClaimQuestionForm
                        questionPayload={questionPayload[0].questionPayload}
                        userAnswers={userAnswers}
                        setUserAnswers={setUserAnswers}
                        userId={userId}
                      />
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Enhanced User Profile Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <UserProfile userId={userId || ""} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default FoundItemDetails;
