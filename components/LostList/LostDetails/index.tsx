"use client";
import React, { useEffect, useState, useCallback } from "react";
import { LostItem } from "@/types/items";
import axios from "axios";
import { User } from "@/types/user";
import Image from "next/image";
import Swal from "sweetalert2";
import { useDropzone } from "react-dropzone";
import MyMap from "@/components/MapWrapper";
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
  const [location, setLocation] = useState<string>(""); // Will store coordinates or address
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
                <ul className="space-y-2">
                  <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="mt-5 flex flex-col items-center pb-10">
                      <img
                        className="mb-3 h-24 w-24 rounded-full object-cover shadow-lg"
                        src={user.profile || "/images/default_pic.png"} // fallback if profile is missing
                        alt={user.username + " profile"}
                      />
                      <h5 className="mb-1 text-xl font-medium text-gray-900 dark:text-white">
                        Name: {user.username}
                      </h5>
                      <span className="my-3 text-sm text-gray-500 dark:text-gray-400">
                        Email: {user.email}
                      </span>
                      <span className="my-3 text-sm text-gray-500 dark:text-gray-400">
                        Phone: {user.contact}
                      </span>
                    </div>
                  </div>
                </ul>
              )}
            </div>
          </div>
          <div className="lg:w-2/3">
            <div className="animate_top border-stroke shadow-solid-13 dark:border-strokedark dark:bg-blacksection rounded-md border bg-white p-7.5 md:p-10">
              <div className="mb-10 w-full overflow-hidden">
                <div className="relative aspect-97/60 w-full sm:aspect-97/44">
                  <Image
                    src={item.imageUrl[0] || "/images/blog/img_1.webp"}
                    alt={parsedDescription.category}
                    fill
                    className="rounded-md object-cover object-center"
                  />
                </div>
              </div>

              <h2 className="2xl:text-sectiontitle2 mt-11 mb-5 text-3xl font-semibold text-black dark:text-white">
                Category: {parsedDescription.category}
              </h2>
              <div className="blog-details">
                <p>Description: {parsedDescription.description}</p>
              </div>
              <div className="blog-details">
                <span className="text-black dark:text-white">Date: </span>{" "}
                {parsedDescription.date}
              </div>
              <div className="blog-details">
                <span className="text-black dark:text-white">Time: </span>{" "}
                {parsedDescription.time}
              </div>
              <div className="blog-details">
                <span className="text-black dark:text-white">Location: </span>{" "}
                {parsedDescription.location}
              </div>
              <MyMap
                position={mapPosition}
                zoom={20}
                onLocationSelect={(lat, lng) => {
                  setMapPosition([lat, lng]);
                  setLocation(`${lat}, ${lng}`);
                }}
                editable={false}
              />
              <label
                htmlFor="dropzone"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Upload image if you have found the item:
              </label>
              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={`mb-7 flex min-h-40 flex-col items-center justify-center gap-2 rounded border-2 border-dashed ${
                  isDragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-400 dark:border-gray-600"
                } p-4 text-center text-gray-500 dark:text-gray-300`}
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
                          className="absolute -top-1 -right-1 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white hover:bg-red-600"
                          title="Remove"
                        >
                          ✕
                        </button>
                        <img
                          src={URL.createObjectURL(file)}
                          alt="Preview"
                          className="h-20 w-20 rounded object-cover"
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
                  // onClick={handleSubmit}
                  aria-label="send message"
                  className="hover:bg-blackho dark:bg-btndark inline-flex items-center gap-2.5 rounded-full bg-black px-6 py-3 font-medium text-white duration-300 ease-in-out"
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
