"use client";
import axios from "axios";
import Swal from "sweetalert2";
import NextImage from "next/image";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import React, { useState, useCallback, useEffect } from "react";
import { AIResponse } from "@/types/airesponse";
import MyMap from "@/components/MapWrapper";

const Submit = () => {
  const [status, setStatus] = useState("Lost");
  const [category, setCategory] = useState("");
  const [otherCategory, setOtherCategory] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = React.useState<File[]>([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [mapPosition, setMapPosition] = useState<[number, number]>([
    3.139, 101.6869,
  ]);
  const [location, setLocation] = useState<string>(""); // Will store coordinates or address

  useEffect(() => {
    const fetchAddress = async () => {
      const [lat, lon] = mapPosition;

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
        );
        const data = await response.json();

        if (data && data.display_name) {
          setLocation(data.display_name);
        } else {
          setLocation("Address not found");
        }
      } catch (error) {
        console.error("Error reverse geocoding:", error);
        setLocation("Error fetching location");
      }
    };

    fetchAddress();
  }, [mapPosition]);

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

  const [aiResponses, setAiResponses] = useState<AIResponse[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("status", status);

    // LOST ITEM HANDLING
    if (status === "Lost") {
      const finalCategory =
        category === "others" ? otherCategory.trim() : category;

      if (!finalCategory || !location || !description || !time || !date) {
        Swal.fire({
          icon: "warning",
          title: "Missing Information",
          text: "Please fill in all fields before submitting.",
        });
        return;
      }
      formData.append("category", finalCategory);
      formData.append("location", location);
      formData.append("description", description);
      formData.append("date", date);
      formData.append("time", time);
      files.forEach((file) => {
        formData.append("images", file);
      });

      try {
        const response = await axios.post(
          "/api/protected/uploadLostItemAPI",
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
            title: "Form Submitted",
            text: "Your lost item has been reported successfully.",
          });
          // Reset form fields
          setCategory("");
          setLocation("");
          setDescription("");
          setDate("");
          setTime("");
          setFiles([]);
          setStatus("Lost"); // optional: reset radio
        }
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Submission Failed",
          text: "Failed to upload lost item.",
        });
        console.log(err);
      }
      return;
    }

    // FOUND ITEM HANDLING
    if (files.length === 0 || !date || !time) {
      Swal.fire({
        icon: "warning",
        title: "Missing fields",
        text: "Please upload at least one image and select the date and time when the item was found.",
      });
      return;
    }

    files.forEach((file) => {
      formData.append("images", file);
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
        "/api/protected/getImageMetaData",
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
          title: "Image analyzed successfully",
          text: "Please review the results and confirm the upload.",
        });
      } else {
        throw new Error("Failed to analyze image.");
      }

      setAiResponses(response.data.data);
      setShowModal(true);
      setCurrentIndex(0);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: "An error occurred while analyzing the image.",
      });
      console.error(err);
    } finally {
      Swal.close();
    }
  };

  const handleConfirmUpload = async () => {
    if (!files.length || !aiResponses.length || !date || !time || !location) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Please ensure all fields are filled before confirming upload.",
      });
      console.log(files, aiResponses, date, time);
      return;
    }
    const formData = new FormData();
    formData.append("date", date);
    formData.append("time", time);
    formData.append("location", location);
    formData.append("status", status); // from your radio button state
    formData.append("metadata", JSON.stringify(aiResponses)); // Gemini results
    files.forEach((file) => {
      formData.append("images", file); // must match getAll("images")
    });
    try {
      const response = await axios.post(
        "/api/protected/uploadFoundItemAPI",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      setAiResponses([]); // reset if needed
      console.log("Upload successful: ", response.data);
    } catch (err) {
      console.log("Unexpected error: ", err);
    }
  };

  return (
    <>
      <section id="support" className="px-4 md:px-8 2xl:px-0">
        <div className="max-w-c-1390 relative mx-auto px-7.5 pt-10 lg:px-15 lg:pt-15 xl:px-20 xl:pt-20">
          <div className="absolute top-0 left-0 -z-1 h-2/3 w-full rounded-lg bg-linear-to-t from-transparent to-[#dee7ff47] dark:bg-linear-to-t dark:to-[#252A42]"></div>
          <div className="absolute bottom-[-255px] left-0 -z-1 h-full w-full">
            <NextImage
              src="./images/shape/shape-dotted-light.svg"
              alt="Dotted"
              className="dark:hidden"
              fill
            />
            <NextImage
              src="./images/shape/shape-dotted-dark.svg"
              alt="Dotted"
              className="hidden dark:block"
              fill
            />
          </div>

          <div className="flex flex-col-reverse flex-wrap gap-8 md:flex-row md:flex-nowrap md:justify-between xl:gap-20">
            <motion.div
              variants={{
                hidden: {
                  opacity: 0,
                  y: -20,
                },

                visible: {
                  opacity: 1,
                  y: 0,
                },
              }}
              initial="hidden"
              whileInView="visible"
              transition={{ duration: 1, delay: 0.1 }}
              viewport={{ once: true }}
              className="animate_top shadow-solid-8 dark:border-strokedark w-full rounded-lg bg-white p-7.5 md:w-3/5 lg:w-3/4 xl:p-15 dark:border dark:bg-black"
            >
              <h2 className="xl:text-sectiontitle2 mb-15 text-3xl font-semibold text-black dark:text-white">
                Report case
              </h2>

              <form method="POST">
                <div className="mb-12.5 flex flex-col gap-7.5 lg:flex-row lg:justify-between lg:gap-14">
                  {/* Status Radio Buttons */}
                  {["Lost", "Found"].map((option) => (
                    <label
                      key={option}
                      className={`mx-5 cursor-pointer rounded-full border px-6 py-2 text-sm font-medium transition ${
                        status === option
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="status"
                        value={option}
                        className="sr-only"
                        checked={status === option}
                        onChange={() => setStatus(option)}
                        required
                      />
                      {option}
                    </label>
                  ))}
                </div>
                {status === "Lost" && files.length === 0 && (
                  <>
                    {/* Category */}
                    <div className="mb-7.5 flex flex-col gap-5 lg:flex-row lg:justify-between lg:gap-14">
                      <select
                        name="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="border-stroke focus:border-waterloo dark:border-strokedark dark:focus:border-manatee w-full border-b bg-transparent pb-3.5 focus-visible:outline-hidden lg:w-1/2 dark:bg-black dark:text-white"
                      >
                        <option value="">Select Category</option>
                        <option value="electronics">
                          Electronics (e.g., phone, laptop)
                        </option>
                        <option value="documents">
                          Important Documents (e.g., ID, passport)
                        </option>
                        <option value="apparel">Clothing & Accessories</option>
                        <option value="keys-wallets">Keys / Wallets</option>
                        <option value="bags">Bags & Luggage</option>
                        <option value="others">Others</option>
                      </select>
                      {category === "others" && (
                        <input
                          type="text"
                          name="otherCategory"
                          value={otherCategory}
                          onChange={(e) => setOtherCategory(e.target.value)}
                          placeholder="Please specify the item category"
                          className="border-stroke focus:border-waterloo dark:border-strokedark dark:focus:border-manatee w-full border-b bg-transparent pb-3.5 focus-visible:outline-hidden lg:w-1/2 dark:bg-black dark:text-white"
                          required
                        />
                      )}
                    </div>
                    {/* Description */}
                    <div className="mb-7.5 flex flex-col gap-5 lg:flex-row lg:justify-between lg:gap-14">
                      <textarea
                        name="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the lost item in detail"
                        rows={4}
                        className="border-stroke focus:border-waterloo dark:border-strokedark dark:focus:border-manatee w-full border-b bg-transparent pb-3.5 focus-visible:outline-hidden lg:w-full dark:bg-black dark:text-white"
                        required
                      ></textarea>
                    </div>
                  </>
                )}
                {/* Date picker and time picker */}
                <div className="mb-7.5 flex flex-col gap-5 lg:flex-row lg:justify-between lg:gap-14">
                  <div className="flex w-full flex-col gap-5 lg:flex-row lg:justify-between lg:gap-14">
                    <input
                      type="date"
                      name="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="border-stroke focus:border-waterloo dark:border-strokedark dark:focus:border-manatee w-full border-b bg-transparent pb-3.5 focus-visible:outline-hidden lg:w-1/2 dark:bg-black dark:text-white"
                      required
                    />
                    <input
                      type="time"
                      name="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="border-stroke focus:border-waterloo dark:border-strokedark dark:focus:border-manatee w-full border-b bg-transparent pb-3.5 focus-visible:outline-hidden lg:w-1/2 dark:bg-black dark:text-white"
                      required
                    />
                  </div>
                </div>
                {/* Location */}
                <div className="mb-7.5 flex flex-col gap-5 lg:flex-row lg:justify-between lg:gap-14">
                  <input
                    type="text"
                    value={location}
                    name="location"
                    readOnly
                    className="border-stroke focus:border-waterloo dark:border-strokedark dark:focus:border-manatee mt-4 w-full border-b bg-transparent pb-3.5 focus-visible:outline-hidden lg:w-full dark:bg-black dark:text-white"
                    placeholder="Location coordinates will appear here"
                  />
                </div>
                {/* Leaflet map */}
                <div className="mb-7.5 flex flex-col gap-5 lg:flex-row lg:justify-between lg:gap-14">
                  <MyMap
                    position={mapPosition}
                    zoom={20}
                    onLocationSelect={(lat, lng) => {
                      setMapPosition([lat, lng]);
                      setLocation(`${lat}, ${lng}`);
                    }}
                    editable={true}
                  />
                </div>
                {/* Dropzone input */}
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
                {/* Show file name */}
                {files.length > 0 && (
                  <div className="mb-4 text-sm text-black dark:text-white">
                    Selected file: {files[0].name}
                  </div>
                )}
                {/* Submit button */}
                <div className="flex flex-wrap gap-4 xl:justify-between">
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    aria-label="send message"
                    className="hover:bg-blackho dark:bg-btndark inline-flex cursor-pointer items-center gap-2.5 rounded-full bg-black px-6 py-3 font-medium text-white duration-300 ease-in-out"
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

              {showModal && aiResponses.length > 0 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                  <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
                    {/* Close Button */}
                    <button
                      className="absolute top-4 right-4 text-2xl font-bold text-black focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                      onClick={() => setShowModal(false)}
                      aria-label="Close modal"
                    >
                      ✕
                    </button>

                    {/* Carousel Content - Scrollable */}
                    <div className="flex-1 overflow-y-auto">
                      <div className="relative min-h-[22rem]">
                        {aiResponses.map((res, index) => (
                          <div
                            key={index}
                            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                              index === currentIndex
                                ? "z-10 opacity-100"
                                : "z-0 opacity-0"
                            }`}
                            data-carousel-item
                          >
                            <div className="overflow-y-auto p-4 text-black dark:text-white">
                              <h2 className="mb-4 text-lg font-semibold">
                                📷 {res.filename}
                              </h2>
                              <ul className="mb-4 space-y-1 text-sm sm:text-base">
                                <li>
                                  <strong>Item Type:</strong>{" "}
                                  {res.metadata.item_type}
                                </li>
                                <li>
                                  <strong>Color:</strong> {res.metadata.color}
                                </li>
                                <li>
                                  <strong>Brand:</strong> {res.metadata.brand}
                                </li>
                                <li>
                                  <strong>Material:</strong>{" "}
                                  {res.metadata.material}
                                </li>
                                <li>
                                  <strong>Condition:</strong>{" "}
                                  {res.metadata.condition}
                                </li>
                              </ul>
                              <h3 className="mb-2 text-base font-medium">
                                Verification Questions:
                              </h3>
                              <ul className="list-disc space-y-2 pl-5 text-sm sm:text-base">
                                {res.questions.map((q, i) => (
                                  <li key={i}>
                                    <strong>Q:</strong> {q.question}
                                    <br />
                                    <strong>A:</strong> {q.answer}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Carousel Controls */}
                    <div className="mt-4 flex items-center justify-between">
                      <button
                        type="button"
                        className="rounded-full bg-gray-200 p-2 hover:bg-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:hover:bg-gray-600"
                        onClick={() =>
                          setCurrentIndex((prev) =>
                            prev > 0 ? prev - 1 : aiResponses.length - 1,
                          )
                        }
                        aria-label="Previous"
                      >
                        <svg
                          className="h-5 w-5 text-black dark:text-white"
                          fill="none"
                          viewBox="0 0 6 10"
                        >
                          <path
                            d="M5 1L1 5l4 4"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {currentIndex + 1} of {aiResponses.length}
                      </span>
                      <button
                        type="button"
                        className="rounded-full bg-gray-200 p-2 hover:bg-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:hover:bg-gray-600"
                        onClick={() =>
                          setCurrentIndex((prev) =>
                            prev < aiResponses.length - 1 ? prev + 1 : 0,
                          )
                        }
                        aria-label="Next"
                      >
                        <svg
                          className="h-5 w-5 text-black dark:text-white"
                          fill="none"
                          viewBox="0 0 6 10"
                        >
                          <path
                            d="M1 9l4-4-4-4"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Footer Buttons */}
                    <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                      <button
                        onClick={() => {
                          setShowModal(false);
                          setCurrentIndex(0);
                        }}
                        className="w-full rounded bg-gray-300 px-4 py-2 text-black hover:bg-gray-400 sm:w-auto dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                      >
                        ✕ Close
                      </button>
                      <button
                        onClick={() => {
                          handleConfirmUpload();
                          setShowModal(false);
                          setCurrentIndex(0);
                        }}
                        className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 sm:w-auto"
                      >
                        ✅ Confirm
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: -20 },
                visible: { opacity: 1, y: 0 },
              }}
              initial="hidden"
              whileInView="visible"
              transition={{ duration: 1.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="animate_top w-full md:w-2/5 md:p-7.5 lg:w-[26%] xl:pt-15"
            >
              <h2 className="xl:text-sectiontitle2 mb-12 text-3xl font-semibold text-black dark:text-white">
                Reach Out to Us
              </h2>

              <div className="mb-7">
                <h3 className="text-metatitle3 mb-4 font-medium text-black dark:text-white">
                  Our Location
                </h3>
                <p>VisionVault HQ, Block D, Jalan Pintar, Kuala Lumpur</p>
              </div>

              <div className="mb-7">
                <h3 className="text-metatitle3 mb-4 font-medium text-black dark:text-white">
                  Email Support
                </h3>
                <p>
                  <a
                    href="mailto:support@visionvault.edu"
                    className="text-blue-600 underline dark:text-blue-400"
                  >
                    support@visionvault.edu
                  </a>
                </p>
              </div>

              <div className="mb-7">
                <h4 className="text-metatitle3 mb-4 font-medium text-black dark:text-white">
                  Call Us
                </h4>
                <p>
                  <a
                    href="tel:+60123456789"
                    className="text-blue-600 underline dark:text-blue-400"
                  >
                    +60 12-345 6789
                  </a>
                </p>
              </div>

              <p className="mt-6 text-sm text-gray-600 dark:text-gray-400">
                We're here to help you reunite with what you've lost. Don't
                hesitate to contact us!
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Submit;
