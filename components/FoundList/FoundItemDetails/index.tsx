"use client";
import axios from "axios";
import Swal from "sweetalert2";
import UserProfile from "@/components/LostList/userProfile";
import ItemLocation from "@/components/LostList/ItemLocation";
import { useDropzone } from "react-dropzone";
import React, { useCallback } from "react";
import { useSearchParams } from "next/navigation";

const FoundItemDetails = () => {
  const searchParams = useSearchParams();
  const foundId = searchParams.get("foundId");
  const location = searchParams.get("location");
  const date = searchParams.get("date");
  const time = searchParams.get("time");
  const category = searchParams.get("category");
  const userId = searchParams.get("userId");

  const [files, setFiles] = React.useState<File[]>([]);
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
      console.log("Verification response: ", response.data);
      return response.data;
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

  const getQuestionPayload = async () => {
    try {
      const response = await axios.post(
        `/api/protected/getQuestionPayloadAPI`,
        { foundId: foundId },
        { withCredentials: true },
      );
      return response.data.foundItems;
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
          <h2 className="2xl:text-sectiontitle2 mt-11 mb-5 text-3xl font-semibold text-black dark:text-white">
            Found Item Details
          </h2>
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
          <form method="POST">
            <div
              {...getRootProps()}
              className={`mb-7 flex min-h-40 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors duration-200 ${
                isDragActive
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800"
              } p-6 text-center text-gray-500 dark:text-gray-300`}
            >
              <input {...getInputProps()} />
              {files.length > 0 ? (
                <div className="flex flex-wrap justify-center gap-4">
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      className="relative flex flex-col items-center gap-1"
                    >
                      <button
                        onClick={() => removeFile(file.name)}
                        className="absolute -top-2 -right-2 cursor-pointer rounded-full bg-red-500 px-2 py-0.5 text-xs text-white shadow hover:bg-red-600"
                        title="Remove"
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
                <p>Drop your images here...</p>
              ) : (
                <p>Drag & drop up to 5 image files, or click to select</p>
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
                onClick={verifyFoundItem}
                aria-label="send message"
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
          {/* Place this outside the form */}
          <button
            type="button"
            onClick={getQuestionPayload}
            className="mt-4 inline-flex cursor-pointer items-center gap-2.5 rounded-full border border-blue-600 bg-white px-8 py-3 font-semibold text-blue-600 shadow hover:bg-blue-50 dark:bg-transparent dark:text-blue-400 dark:hover:bg-blue-900"
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
      </div>
      <UserProfile userId={userId || ""} />
    </>
  );
};
export default FoundItemDetails;
