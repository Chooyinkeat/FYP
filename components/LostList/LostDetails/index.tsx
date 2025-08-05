"use client";
import React, { useEffect, useState, useCallback } from "react";
import { LostItem } from "@/types/items";
import { Description } from "@/types/items";
import axios from "axios";
import Image from "next/image";
import Swal from "sweetalert2";
import { useDropzone } from "react-dropzone";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/pagination";
import "swiper/css/navigation";
import UserProfile from "@/components/LostList/userProfile";
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
  const query = new URLSearchParams(window.location.search);
  const id = query.get("id");
  const [showButton, setShowButton] = useState(false);
  const [item, setItem] = useState<LostItem | null>(null);
  const [parsedDescription, setParsedDescription] =
    useState<Description | null>(null);
  const [averageScore, setAverageScore] = useState(0);

  // Dropzone state
  const [files, setFiles] = React.useState<File[]>([]);
  const [results, setResults] = useState<any[]>([]);

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

  const notifyUser = async (formData: FormData, userId: string) => {
    formData.append("userId", userId);
    try {
      const response = await axios.post(
        "/api/protected/notifyUserAPI",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      if (response.status === 200) {
        setFiles([]);
        Swal.fire({
          icon: "success",
          title: "Notification Sent",
          text: "The owner has been notified successfully.",
        });
      }
    } catch (error) {
      console.log("Unexpected error (notifyUser): ", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      formData.append("userImages", file); // must match getAll("images")
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
          console.log("Image analysis response: ", response.data);
          setResults(response.data.data);
          setAverageScore(response.data.averageScore);
        }
      } catch (error) {
        console.log("Unexpected error: ", error);
      } finally {
        Swal.close();
      }
    } else {
      await notifyUser(formData, item?.userId || "");
    }
  };

  useEffect(() => {
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
              setShowButton(true);
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
      <div className="text-center text-gray-500">Loading item details...</div>
    );
  }

  return (
    <>
      {item && parsedDescription ? (
        <>
          <div className="lg:w-2/3">
            <div className="animate_top border-stroke dark:border-strokedark dark:bg-blacksection rounded-2xl border bg-white p-8 shadow-lg md:p-12">
              <div className="mb-8 w-full overflow-hidden">
                <div className="relative aspect-[16/9] w-full rounded-lg shadow-md">
                  <Swiper
                    pagination={{ clickable: true }}
                    className="h-full w-full cursor-pointer rounded-md"
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
                          className="rounded-md object-cover"
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <h2 className="2xl:text-sectiontitle2 mt-11 mb-5 text-3xl font-semibold text-black dark:text-white">
                  Lost Item Details
                </h2>
                {showButton && (
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
                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:bg-red-700 focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:outline-none dark:bg-red-500 dark:hover:bg-red-600"
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
              <div className="mb-4 text-lg text-gray-700 dark:text-gray-200">
                <p className="mb-2">
                  <span className="font-semibold">Description:</span>{" "}
                  {parsedDescription.description}
                </p>
                <p className="mb-2">
                  <span className="font-semibold">Date:</span>{" "}
                  {parsedDescription.date}
                </p>
                <p className="mb-2">
                  <span className="font-semibold">Time:</span>{" "}
                  {parsedDescription.time}
                </p>
                <p className="mb-2">
                  <span className="font-semibold">Location:</span>{" "}
                  {parsedDescription.location}
                </p>
              </div>
              <ItemLocation location={parsedDescription.location} />

              <label
                htmlFor="dropzone"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {item?.imageUrl?.length > 0
                  ? "Upload image to check similarity:"
                  : "Upload image to notify user: "}
              </label>

              <form onSubmit={handleSubmit}>
                <div
                  {...getRootProps()}
                  className={`mb-7 flex min-h-40 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors duration-200 focus-within:ring-2 focus-within:ring-blue-400 sm:min-h-48 md:min-h-56 ${
                    isDragActive
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800"
                  } p-6 text-center text-gray-500 dark:text-gray-300`}
                  tabIndex={0}
                >
                  <input {...getInputProps()} />
                  {files.length > 0 ? (
                    <div className="flex w-full flex-wrap justify-center gap-4">
                      {files.map((file, idx) => (
                        <div
                          key={idx}
                          className="relative flex flex-col items-center gap-1 rounded-lg bg-white p-2 shadow-md dark:bg-gray-900"
                        >
                          <button
                            onClick={() => removeFile(file.name)}
                            className="absolute -top-2 -right-2 cursor-pointer rounded-full bg-red-500 px-2 py-0.5 text-xs text-white shadow hover:bg-red-600 focus:ring-2 focus:ring-red-300 focus:outline-none"
                            title="Remove"
                            type="button"
                          >
                            ✕
                          </button>
                          <img
                            src={URL.createObjectURL(file)}
                            alt="Preview"
                            className="h-20 w-20 rounded object-cover shadow"
                          />
                          <p className="max-w-[80px] truncate text-center text-xs text-black dark:text-white">
                            {file.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : isDragActive ? (
                    <p className="text-blue-600 dark:text-blue-400">
                      Drop your images here...
                    </p>
                  ) : (
                    <p className="text-sm sm:text-base">
                      Drag & drop up to 5 image files, or{" "}
                      <span className="cursor-pointer text-blue-600 underline">
                        click to select
                      </span>
                    </p>
                  )}
                </div>

                {files.length > 0 && (
                  <div className="mb-4 text-sm text-black dark:text-white">
                    Selected file: {files[0].name}
                  </div>
                )}

                <div className="flex flex-wrap gap-4 xl:justify-between">
                  <button
                    type="submit"
                    className="inline-flex cursor-pointer items-center gap-2.5 rounded-full bg-blue-600 px-8 py-3 font-semibold text-white shadow transition hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    Submit
                    <svg
                      className="fill-white"
                      width="14"
                      height="14"
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
              </form>
              {results.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                    Image Analysis Results
                  </h3>
                  <div className="font-medium text-blue-800 dark:text-blue-200">
                    🧮 Average Similarity Score: {averageScore.toFixed(2)} / 100
                  </div>
                  {averageScore >= 80 && (
                    <button
                      className="mt-4 mb-6 rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
                      onClick={async () => {
                        const formData = new FormData();
                        files.forEach((file) => {
                          formData.append("userImages", file); // must match getAll("images")
                        });
                        await notifyUser(formData, item.userId);
                      }}
                    >
                      🔔 Notify Owner
                    </button>
                  )}
                  {results.map((result, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-blue-200 bg-blue-50 p-4 shadow dark:bg-blue-900/30"
                    >
                      {/* <div className="font-medium text-blue-800 dark:text-blue-200">
                        User Image #{result.userImageIndex + 1} vs Lost Image #
                        {result.lostImageIndex + 1}
                      </div> */}
                      <div className="flex items-center gap-4">
                        {/* User Image */}
                        <div className="flex flex-col items-center">
                          <p className="text-xs text-blue-800 dark:text-blue-200">
                            User Image #{result.userImageIndex + 1}
                          </p>
                          <img
                            src={URL.createObjectURL(
                              files[result.userImageIndex],
                            )}
                            alt={`User Image ${result.userImageIndex + 1}`}
                            className="h-24 w-24 rounded border object-cover shadow"
                          />
                        </div>

                        <div className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                          vs
                        </div>

                        {/* Lost Image */}
                        <div className="flex flex-col items-center">
                          <p className="text-xs text-blue-800 dark:text-blue-200">
                            Lost Image #{result.lostImageIndex + 1}
                          </p>
                          <img
                            src={result.lostImageUrl}
                            alt={`Lost Image ${result.lostImageIndex + 1}`}
                            className="h-24 w-24 rounded border object-cover shadow"
                          />
                        </div>
                      </div>

                      <div
                        className="mt-2 text-sm text-gray-800 dark:text-gray-100"
                        dangerouslySetInnerHTML={{
                          __html: result.similarityScore.replace(
                            /\n/g,
                            "<br/>",
                          ),
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <UserProfile userId={item.userId} />
        </>
      ) : (
        <div className="text-center text-gray-500">Loading item details...</div>
      )}
    </>
  );
};
export default LostDetails;
