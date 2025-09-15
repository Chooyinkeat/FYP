"use client";
import React, { useEffect, useState, useCallback } from "react";
import { LostItem } from "@/types/items";
import { Description } from "@/types/items";
import axios from "axios";
import Image from "next/image";
import Swal from "sweetalert2";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import UserProfile from "@/components/LostList/UserProfile";
import ItemLocation from "@/components/LostList/ItemLocation";

const fetchDetails = async (id: string) => {
  try {
    const response = await axios.post(
      "/api/protected/getLostItemAPI/getSingleItemAPI",
      { id },
      { withCredentials: true },
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching item details:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to fetch item details.",
    });
  }
};
const updateItemStatus = async (id: string) => {
  try {
    const response = await axios.post(
      "/api/protected/updateItemStatusAPI",
      { itemId: id, type: "lost" },
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

const LostDetails = () => {
  const router = useRouter();

  const [id, setId] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const [item, setItem] = useState<LostItem | null>(null);
  const [parsedDescription, setParsedDescription] =
    useState<Description | null>(null);
  const [averageScore, setAverageScore] = useState(0);

  // Dropzone state
  const [files, setFiles] = React.useState<File[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [urls, setUrls] = useState<string[]>([]);

  // React dropzone setup
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

  const handleSubmit = async (e: React.FormEvent, userId: string) => {
    e.preventDefault();
    if (files.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No images selected",
        text: "Please upload at least one image.",
      });
      return;
    }
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("userImages", file);
    });
    if (item && item.imageUrl && item.imageUrl.length > 0) {
      formData.append("imageUrl", JSON.stringify(item.imageUrl));
      try {
        Swal.fire({
          title: "Analyzing Image...",
          text: "Please wait while the AI processes your image.",
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
        const response = await axios.post(
          "/api/protected/analyzeImage",
          formData,
          {
            withCredentials: true,
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        );
        if (response.status === 200) {
          setResults(response.data.data);
          setAverageScore(response.data.averageScore);
          console.log("Testing : ", response.data.urls);
          setUrls(response.data.urls);
        }
      } catch (error) {
        console.log("Unexpected error: ", error);
      } finally {
        Swal.close();
      }
    }
  };

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const id = query.get("id");
    setId(id);
    if (id) {
      fetchDetails(id)
        .then((response) => {
          if (response.success && response.status === 200) {
            const item = response.data[0];
            setItem(item);
            const desc = JSON.parse(item.description);
            setParsedDescription(desc);
            const sessionUserId = sessionStorage.getItem("userId");
            if (item.userId == sessionUserId) {
              setShow(true);
            }
          } else {
            Swal.fire({
              icon: "info",
              title: "No Item Found",
              text: "The requested item does not exist.",
            });
          }
        })
        .catch((error) => {
          console.error("Error fetching item details:", error);
        });
    }
  }, []);

  if (!item || !parsedDescription) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Loading item details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8 dark:from-gray-900 dark:to-gray-800">
      {item && parsedDescription ? (
        <div className="mx-auto max-w-7xl">
          {/* Enhanced Header Section */}
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl dark:text-white">
              Lost Item Details
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Review and manage your lost item case
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content - Enhanced */}
            <div className="lg:col-span-2">
              <div className="overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-gray-800 dark:shadow-2xl">
                {/* Enhanced Image Gallery */}
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <Swiper
                    pagination={{ clickable: true }}
                    className="h-full w-full cursor-pointer"
                  >
                    {(item.imageUrl.length > 0
                      ? item.imageUrl
                      : ["/images/blog/img_1.webp"]
                    ).map((imgUrl, i) => (
                      <SwiperSlide key={i}>
                        <Image
                          src={imgUrl}
                          alt={`Lost item ${i + 1}`}
                          fill
                          className="object-cover"
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>

                <div className="p-6 sm:p-8">
                  {/* Header with Close Case Button */}
                  <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
                        {parsedDescription.description}
                      </h2>
                      <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Case ID: {item.lostId}
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
                              if (id) {
                                updateItemStatus(id).then((data) => {
                                  if (data?.success) {
                                    Swal.fire({
                                      icon: "success",
                                      title: "Success",
                                      text: "Item status updated successfully.",
                                    }).then(() => {
                                      window.location.href = "/lostItems";
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

                  {/* Enhanced Item Details */}
                  <div className="mb-8 rounded-xl bg-gray-50 p-6 dark:bg-gray-700">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                      📋 Item Information
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                            <i className="fa fa-file-text text-blue-600 dark:text-blue-400"></i>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Description
                            </p>
                            <p className="text-gray-900 dark:text-white">
                              {parsedDescription.description}
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
                              {parsedDescription.date}
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
                              {parsedDescription.time}
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
                              {parsedDescription.location}
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
                      <ItemLocation location={parsedDescription.location} />
                    </div>
                  </div>

                  {/* Enhanced Image Upload Section */}
                  {!show && (
                    <div className="space-y-6">
                      <div className="rounded-xl bg-blue-50 p-6 dark:bg-blue-900/20">
                        <h3 className="mb-4 text-lg font-semibold text-blue-900 dark:text-blue-100">
                          🔍 Image Analysis
                        </h3>
                        <p className="mb-4 text-sm text-blue-800 dark:text-blue-200">
                          {item?.imageUrl?.length > 0
                            ? "Upload images to check similarity with the lost item:"
                            : "Upload images to notify the user about your found item:"}
                        </p>

                        <form onSubmit={(e) => handleSubmit(e, item.userId)}>
                          {/* Enhanced Dropzone */}
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

                          {/* Enhanced Submit Button */}
                          {files.length > 0 && (
                            <div className="mb-6 flex items-center justify-center">
                              <button
                                type="submit"
                                className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:outline-none dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700"
                              >
                                <i className="fa fa-search text-lg"></i>
                                Analyze Images
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
                          )}
                        </form>

                        {/* Enhanced Analysis Results */}
                        {results.length > 0 && (
                          <div className="mt-8 space-y-6">
                            <div className="rounded-xl bg-gradient-to-r from-green-500 to-green-600 p-6 text-center text-white shadow-lg">
                              <h3 className="mb-2 text-xl font-bold">
                                Image Analysis Results
                              </h3>
                              <div className="text-2xl font-bold">
                                🧮 Average Similarity Score:{" "}
                                {averageScore.toFixed(2)} / 100
                              </div>
                              {averageScore >= 80 && (
                                <div className="mt-4">
                                  <button
                                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-green-600 shadow-lg transition-all duration-300 hover:bg-gray-50 hover:shadow-xl"
                                    onClick={() => {
                                      router.push(
                                        `/appointment?userId=${encodeURIComponent(
                                          item.userId,
                                        )}&urls=${encodeURIComponent(
                                          JSON.stringify(urls),
                                        )}&caseId=${encodeURIComponent(
                                          item.lostId ?? "",
                                        )}`,
                                      );
                                    }}
                                  >
                                    🔔 Schedule Meet Up
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Enhanced Result Cards */}
                            <div className="grid gap-4">
                              {results.map((result, idx) => (
                                <div
                                  key={idx}
                                  className="overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 p-6 shadow-lg dark:border-blue-700 dark:from-blue-900/30 dark:to-blue-800/30"
                                >
                                  <div className="mb-4 text-center">
                                    <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                                      Comparison #{idx + 1}
                                    </h4>
                                  </div>

                                  <div className="grid items-center gap-6 sm:grid-cols-3">
                                    {/* User Image */}
                                    <div className="flex flex-col items-center space-y-2">
                                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                        Your Image #{result.userImageIndex + 1}
                                      </p>
                                      <img
                                        src={URL.createObjectURL(
                                          files[result.userImageIndex],
                                        )}
                                        alt={`User Image ${
                                          result.userImageIndex + 1
                                        }`}
                                        className="h-24 w-24 rounded-lg border-2 border-blue-300 object-cover shadow-md dark:border-blue-600"
                                      />
                                    </div>

                                    {/* VS Indicator */}
                                    <div className="flex flex-col items-center justify-center">
                                      <div className="rounded-full bg-blue-600 p-3 text-white shadow-lg">
                                        <span className="text-lg font-bold">
                                          VS
                                        </span>
                                      </div>
                                    </div>

                                    {/* Lost Image */}
                                    <div className="flex flex-col items-center space-y-2">
                                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                        Lost Image #{result.lostImageIndex + 1}
                                      </p>
                                      <img
                                        src={result.lostImageUrl}
                                        alt={`Lost Image ${
                                          result.lostImageIndex + 1
                                        }`}
                                        className="h-24 w-24 rounded-lg border-2 border-blue-300 object-cover shadow-md dark:border-blue-600"
                                      />
                                    </div>
                                  </div>

                                  {/* Similarity Score */}
                                  <div className="mt-4 rounded-lg bg-white p-4 text-center shadow-md dark:bg-gray-800">
                                    <div
                                      className="text-sm text-gray-800 dark:text-gray-100"
                                      dangerouslySetInnerHTML={{
                                        __html: result.similarityScore.replace(
                                          /\n/g,
                                          "<br/>",
                                        ),
                                      }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced User Profile Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <UserProfile userId={item.userId} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Loading item details...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
export default LostDetails;
