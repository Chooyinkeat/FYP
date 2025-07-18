"use client";
import React, { useEffect, useState, useCallback } from "react";
import { LostItem } from "@/types/items";
import axios from "axios";
import { Description } from "@/types/items";
import Image from "next/image";
import Swal from "sweetalert2";
import { useDropzone } from "react-dropzone";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import UserProfile from "@/components/LostList/userProfile";
import ItemLocation from "@/components/LostList/ItemLocation";

const AnalysisModal = ({
  open,
  onClose,
  results,
}: {
  open: boolean;
  onClose: () => void;
  results: any[];
}) => {
  if (!open) return null;
  return (
    <div className="bg-opacity-40 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-lg dark:bg-gray-900">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="mb-4 text-center text-xl font-bold">
          Image Analysis Results
        </h2>
        <div className="max-h-96 space-y-4 overflow-y-auto">
          {results.length === 0 ? (
            <p>No results to display.</p>
          ) : (
            results.map((result, idx) => (
              <div key={idx} className="border-b pb-2">
                <div className="font-semibold">
                  User Image {result.userImageIndex + 1} vs Lost Image{" "}
                  {result.lostImageIndex + 1}
                </div>
                <div className="text-sm whitespace-pre-line">
                  {result.similarityScore}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const LostDetails = () => {
  const [item, setItem] = useState<LostItem | null>(null);
  const [parsedDescription, setParsedDescription] =
    useState<Description | null>(null);
  // Dropzone state
  const [files, setFiles] = React.useState<File[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);

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
    if (item && item.imageUrl) {
      formData.append("imageUrl", JSON.stringify(item.imageUrl));
    }
    files.forEach((file) => {
      formData.append("userImages", file); // must match getAll("images")
    });
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
        setAnalysisResults(response.data.data); // assuming response.data.data is the array
        setModalOpen(true);
        console.log("Analysis results: ", response.data.data);
        setFiles([]);
      }
    } catch (error) {
      console.log("Unexpected error: ", error);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("selectedLostItem");
    if (stored) {
      try {
        const parsed: LostItem = JSON.parse(stored);
        setItem(parsed);
        const desc = JSON.parse(parsed.description);
        setParsedDescription(desc);
      } catch (err) {
        console.log("Failed to load or parse lost item:", err);
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      localStorage.removeItem("selectedLostItem");
    };
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
          <UserProfile userId={item.userId} />
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

              <h2 className="mt-8 mb-4 text-3xl font-bold text-gray-900 dark:text-white">
                Category:{" "}
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {parsedDescription.category}
                </span>
              </h2>
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
                Upload image if you have found the item:
              </label>
              <form onSubmit={handleSubmit}>
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
                            className="absolute -top-2 -right-2 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white shadow hover:bg-red-600"
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
                    aria-label="send message"
                    className="inline-flex items-center gap-2.5 rounded-full bg-blue-600 px-8 py-3 font-semibold text-white shadow transition hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
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
            </div>
          </div>
          <AnalysisModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            results={analysisResults}
          />
        </>
      ) : (
        <div className="text-center text-gray-500">Loading item details...</div>
      )}
    </>
  );
};
export default LostDetails;
