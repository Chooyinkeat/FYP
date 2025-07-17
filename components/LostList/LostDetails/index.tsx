"use client";
import React, { useEffect, useState, useCallback } from "react";
import { LostItem } from "@/types/items";
import axios from "axios";
import { User } from "@/types/user";
import Image from "next/image";
import Swal from "sweetalert2";
import { useDropzone } from "react-dropzone";
import MyMap from "@/components/MapWrapper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";

const LostDetails = () => {
  const [item, setItem] = useState<LostItem | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [parsedDescription, setParsedDescription] = useState<{
    category: string;
    location: string;
    description: string;
    date: string;
    time: string;
  } | null>(null);

  // Dropzone state
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

  // Map state
  const [mapPosition, setMapPosition] = useState<[number, number]>([
    3.139, 101.6869,
  ]); // Default to KL

  const fetchUserData = async (userId: string) => {
    try {
      const response = await axios.post(
        "/api/protected/fetchUserAPI",
        { userId },
        { withCredentials: true },
      );
      return response.data;
    } catch (error) {
      console.log("Error fetching user data:", error);
      return null;
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
        Swal.fire({
          icon: "success",
          title: "Images submitted successfully",
          text: response.data.data,
        });
        console.log("Analysis results: ", response.data);
        setFiles([]);
      }
    } catch (error) {
      console.log("Unexpected error: ", error);
    }
  };

  const geocodeAddress = async (
    address: string,
  ): Promise<[number, number] | null> => {
    try {
      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.set("q", address);
      url.searchParams.set("format", "json");
      url.searchParams.set("limit", "1");

      const res = await fetch(url.toString());
      const data = await res.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        return [lat, lon];
      }
    } catch (err) {
      console.error("Geocoding failed:", err);
    }
    return null;
  };

  useEffect(() => {
    const stored = localStorage.getItem("selectedLostItem");
    if (stored) {
      try {
        const parsed: LostItem = JSON.parse(stored);
        setItem(parsed);

        // Fetch user data if needed
        fetchUserData(parsed.userId).then((data) => {
          if (data.status === 200) {
            setUser(data.user);
          }
        });
        const desc = JSON.parse(parsed.description);
        setParsedDescription(desc);

        // 🧠 Forward geocode the location to lat/lng
        geocodeAddress(desc.location).then((coords) => {
          if (coords) {
            setMapPosition(coords);
          } else {
            console.warn("Could not geocode address:", desc.location);
          }
        });
      } catch (err) {
        console.error("Failed to load or parse lost item:", err);
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
          <div className="md:w-1/2 lg:w-[32%]">
            <div className="animate_top border-stroke shadow-solid-13 dark:border-strokedark dark:bg-blacksection mb-10 rounded-md border bg-white p-9">
              {user && (
                <div className="flex justify-center">
                  <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-gradient-to-br from-white via-blue-50 to-blue-100 p-6 shadow-xl dark:border-gray-700 dark:bg-gradient-to-br dark:from-gray-800 dark:via-gray-900 dark:to-gray-800">
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <img
                          className="h-28 w-28 rounded-full border-4 border-blue-500 object-cover shadow-lg"
                          src={user.profile || "/images/default_pic.png"}
                          alt={user.username + " profile"}
                        />
                      </div>
                      <h5 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
                        {user.username}
                      </h5>
                      <div className="mt-2 flex flex-col items-center gap-1">
                        <span className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                          <svg
                            className="h-4 w-4 text-blue-500"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                            <path
                              d="M12 14v7m0 0H7m5 0h5"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                          </svg>
                          {user.email}
                        </span>
                        <span className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                          <svg
                            className="h-4 w-4 text-blue-500"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="M2 8.5C2 6.015 4.015 4 6.5 4h11C19.985 4 22 6.015 22 8.5v7c0 2.485-2.015 4.5-4.5 4.5h-11C4.015 20 2 17.985 2 15.5v-7Z"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                            <path
                              d="M6 9h.01M12 15h.01M18 9h.01"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                          {user.contact}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
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
              <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                <MyMap
                  position={mapPosition}
                  zoom={20}
                  onLocationSelect={(lat, lng) => {
                    setMapPosition([lat, lng]);
                  }}
                  editable={false}
                />
              </div>
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
        </>
      ) : (
        <div className="text-center text-gray-500">Loading item details...</div>
      )}
    </>
  );
};
export default LostDetails;
