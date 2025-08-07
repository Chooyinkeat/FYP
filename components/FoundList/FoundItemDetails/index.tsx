"use client";
import axios from "axios";
import Swal from "sweetalert2";
import { useDropzone } from "react-dropzone";
import { useSearchParams } from "next/navigation";
import UserProfile from "@/components/LostList/UserProfile";
import ItemLocation from "@/components/LostList/ItemLocation";
import ClaimQuestionForm from "@/components/FoundList/Question";
import React, { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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

  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [questionPayload, setQuestionPayload] = useState<any[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>[]>([]);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const urlUserId = searchParams.get("userId");
    const sessionUserId = sessionStorage.getItem("userId");

    if (urlUserId && sessionUserId && urlUserId === sessionUserId) {
      setShowButton(true);
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

  const verifyFoundItem = async (e: React.FormEvent) => {
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
        setResults(response.data.data);
        if (response.data.averageScore >= 80) {
          formData.append("userId", userId ?? "");
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Your images are highly similar (above 80%) to the found item. The founder has been notified.",
          });
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
            if (response.data.success) {
              setFiles([]);
            }
          } catch (error) {
            console.log("Error notifying user:", error);
            Swal.fire({
              icon: "error",
              title: "Notification Failed",
              text: "Failed to notify the user about the found item.",
            });
          }
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
            if (response.status === 200) {
              console.log("Fake claim API response: ", response.data);
            } else {
              console.log(
                "Fake claim API failed with status: ",
                response.data.message,
              );
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
    } finally {
      Swal.close();
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
    <>
      <div className="lg:w-2/3">
        <div className="animate_top border-stroke shadow-solid-13 dark:border-strokedark dark:bg-blacksection rounded-md border bg-white p-7.5 md:p-10">
          <div className="flex items-center justify-between">
            <h2 className="2xl:text-sectiontitle2 mt-11 mb-5 text-3xl font-semibold text-black dark:text-white">
              Found Item Details
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
              <span className="font-semibold">Category:</span>{" "}
              {category || "Unknown Category"}
            </p>
            <p className="mb-2">
              <span className="font-semibold">Date:</span>{" "}
              {date || "Unknown Date"}
            </p>
            <p className="mb-2">
              <span className="font-semibold">Time:</span>{" "}
              {time || "Unknown Time"}
            </p>
            <p className="mb-2">
              <span className="font-semibold">Location:</span>{" "}
              {location || "Unknown Location"}
            </p>
          </div>
          <ItemLocation location={location || "Unknown Location"} />
          <label
            htmlFor="dropzone"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Upload image if you have found the item:
          </label>
          <form method="POST" className="mx-auto w-full max-w-2xl">
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
            <div className="flex flex-col gap-4 sm:flex-row xl:justify-between">
              <button
                type="submit"
                onClick={verifyFoundItem}
                aria-label="send message"
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-full bg-blue-600 px-8 py-3 font-semibold text-white shadow transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:outline-none sm:w-auto dark:bg-blue-500 dark:hover:bg-blue-600"
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
              <button
                type="button"
                onClick={getQuestionPayload}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-full border border-blue-600 bg-white px-8 py-3 font-semibold text-blue-600 shadow hover:bg-blue-50 focus:ring-2 focus:ring-blue-400 focus:outline-none sm:w-auto dark:bg-transparent dark:text-blue-400 dark:hover:bg-blue-900"
              >
                Get Questions Without Image
                <svg
                  className="fill-current"
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10.4767 6.16664L6.00668 1.69664L7.18501 0.518311L13.6667 6.99998L7.18501 13.4816L6.00668 12.3033L10.4767 7.83331H0.333344V6.16664H10.4767Z" />
                </svg>
              </button>
            </div>
          </form>
          {/* {results.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                Image Analysis Results
              </h3>
              {results.map((result, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-blue-200 bg-blue-50 p-4 shadow dark:bg-blue-900/30"
                >
                  <div className="font-medium text-blue-800 dark:text-blue-200">
                    User Image #{result.userImageIndex + 1} vs Lost Image #
                    {result.lostImageIndex + 1}
                  </div>
                  <div
                    className="mt-2 text-sm text-gray-800 dark:text-gray-100"
                    dangerouslySetInnerHTML={{
                      __html: result.similarityScore.replace(/\n/g, "<br/>"),
                    }}
                  />
                </div>
              ))}
            </div>
          )} */}
          {questionPayload.length > 0 &&
            questionPayload[0]?.questionPayload && (
              <ClaimQuestionForm
                questionPayload={questionPayload[0].questionPayload}
                userAnswers={userAnswers}
                setUserAnswers={setUserAnswers}
                userId={userId}
              />
            )}
        </div>
      </div>
      <UserProfile userId={userId || ""} />
    </>
  );
};
export default FoundItemDetails;
