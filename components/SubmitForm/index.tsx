"use client";
import axios from "axios";
import Swal from "sweetalert2";
import NextImage from "next/image";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { AIResponse } from "@/types/airesponse";
import MyMap from "@/components/MapWrapper";
import React, { useState, useCallback, useEffect } from "react";

const Submit = () => {
  const [status, setStatus] = useState("Lost");
  const [category, setCategory] = useState("");
  const [otherCategory, setOtherCategory] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = React.useState<File[]>([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState({});

  const [mapPosition, setMapPosition] = useState<[number, number]>([
    3.139, 101.6869,
  ]);
  const [location, setLocation] = useState<string>("");

  const handleForwardGeocode = async () => {
    if (!location.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          location,
        )}`,
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        setMapPosition([parseFloat(lat), parseFloat(lon)]);
        setLocation(display_name); // normalize the input to display name
      } else {
        Swal.fire({
          icon: "warning",
          title: "Location not found",
          text: "Please enter a valid address or location.",
        });
        setLocation(""); // clear the input if no results
        setMapPosition([3.139, 101.6869]); // reset to default position
      }
    } catch (error) {
      console.error("Forward geocoding error:", error);
    }
  };

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
          setCategory("");
          setLocation("");
          setDescription("");
          setDate("");
          setTime("");
          setFiles([]);
          setStatus("Lost");
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
      const aiData = response.data.data;
      const aiDataWithPreview = aiData.map((item: any, index: number) => ({
        ...item,
        previewUrl: URL.createObjectURL(files[index]), // This assumes order is preserved
      }));
      setAiResponses(aiDataWithPreview);
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
      return;
    }

    const hasSelected = Object.values(selectedQuestions).some(
      (val) => val === true,
    );
    if (!hasSelected) {
      Swal.fire({
        icon: "warning",
        title: "No Questions Selected",
        text: "Please select at least one verification question before confirming upload.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("date", date);
    formData.append("time", time);
    formData.append("location", location);
    formData.append("status", status);

    const filteredResponses = aiResponses.map((res, resIndex) => {
      const selectedLevel1 = res.questions.level_1.filter(
        (_, i) => selectedQuestions[`l1-${resIndex}-${i}`],
      );
      const selectedLevel2 = res.questions.level_2.filter(
        (_, i) => selectedQuestions[`l2-${resIndex}-${i}`],
      );
      return {
        filename: res.filename,
        category: res.category,
        metadata: res.metadata,
        questions: {
          level_1: selectedLevel1,
          level_2: selectedLevel2,
        },
      };
    });

    formData.append("metadata", JSON.stringify(filteredResponses));
    files.forEach((file) => formData.append("images", file));

    try {
      const response = await axios.post(
        "/api/protected/uploadFoundItemAPI",
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Upload Successful",
          text: "Your found item has been reported successfully.",
        });
        setAiResponses([]);
        setFiles([]);
        setShowModal(false);
        setCurrentIndex(0);
      }
    } catch (err) {
      console.log("Unexpected error: ", err);
    }
  };

  return (
    <>
      <section id="submit" className="px-4 md:px-8 2xl:px-0">
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

              <form
                method="POST"
                className="space-y-8 rounded-xl bg-white p-6 shadow-lg dark:bg-gray-900"
              >
                {/* Status Radio Buttons */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                  {["Lost", "Found"].map((option) => (
                    <label
                      key={option}
                      className={`cursor-pointer rounded-full border px-6 py-2 text-sm font-medium transition-all duration-200 ${
                        status === option
                          ? "border-blue-600 bg-blue-600 text-white shadow-md"
                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
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
                    <div className="flex flex-col gap-5 lg:flex-row lg:gap-8">
                      <select
                        name="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
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
                          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                          required
                        />
                      )}
                    </div>

                    {/* Description */}
                    <textarea
                      name="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the lost item in detail"
                      rows={4}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                      required
                    ></textarea>
                  </>
                )}

                {/* Date and Time */}
                <div className="flex flex-col gap-5 lg:flex-row lg:gap-8">
                  <input
                    type="date"
                    name="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                    required
                  />
                  <input
                    type="time"
                    name="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                    required
                  />
                </div>

                {/* Location */}
                <input
                  type="text"
                  value={location}
                  name="location"
                  onChange={(e) => setLocation(e.target.value)}
                  onBlur={handleForwardGeocode}
                  placeholder="Enter address or location..."
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                />

                {/* Map */}
                <div className="relative z-0 overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600">
                  <MyMap
                    position={mapPosition}
                    zoom={20}
                    onLocationSelect={(lat, lng) => {
                      setMapPosition([lat, lng]);
                    }}
                    editable={true}
                  />
                </div>

                {/* Dropzone */}
                <div
                  {...getRootProps()}
                  className={`flex min-h-40 flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed transition-colors duration-200 ${
                    isDragActive
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-400 dark:border-gray-600"
                  } p-6 text-center text-gray-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800`}
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
                            className="h-20 w-20 rounded-lg object-cover shadow-sm"
                          />
                          <p className="max-w-[80px] truncate text-center text-xs text-gray-700 dark:text-gray-200">
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

                {/* File name */}
                {files.length > 0 && (
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Selected file: {files[0].name}
                  </div>
                )}

                {/* Submit */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    aria-label="send message"
                    className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-medium text-white shadow-lg transition-all duration-200 hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    Submit
                    <svg
                      className="fill-white"
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M10.4767 6.16664L6.00668 1.69664L7.18501 0.518311L13.6667 6.99998L7.18501 13.4816L6.00668 12.3033L10.4767 7.83331H0.333344V6.16664H10.4767Z" />
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
                              <img
                                src={res.previewUrl}
                                alt={res.filename}
                                className="mb-4 w-full rounded-lg object-contain shadow"
                              />
                              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                {res.filename}
                              </p>

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
                              </ul>
                              <h3 className="mb-2 text-base font-medium">
                                Verification Questions:
                              </h3>
                              <ul className="list-disc space-y-2 pl-5 text-sm sm:text-base">
                                <>
                                  {/* level_1 */}
                                  {res.questions.level_1.map((q, i) => (
                                    <li
                                      key={`l1-${i}`}
                                      className="flex items-start gap-2"
                                    >
                                      <input
                                        type="checkbox"
                                        id={`l1-checkbox-${index}-${i}`}
                                        className="mt-1"
                                        checked={
                                          selectedQuestions[
                                            `l1-${index}-${i}`
                                          ] || false
                                        }
                                        onChange={(e) =>
                                          setSelectedQuestions((prev) => ({
                                            ...prev,
                                            [`l1-${index}-${i}`]:
                                              e.target.checked,
                                          }))
                                        }
                                      />
                                      <label
                                        htmlFor={`l1-checkbox-${index}-${i}`}
                                      >
                                        <strong>Q (Level 1):</strong>{" "}
                                        {q.question}
                                        <br />
                                        <strong>A:</strong> {q.answer}
                                      </label>
                                    </li>
                                  ))}
                                  {/* level_2 */}
                                  {res.questions.level_2.map((q, i) => (
                                    <li
                                      key={`l2-${i}`}
                                      className="flex items-start gap-2"
                                    >
                                      <input
                                        type="checkbox"
                                        id={`l2-checkbox-${index}-${i}`}
                                        className="mt-1"
                                        checked={
                                          selectedQuestions[
                                            `l2-${index}-${i}`
                                          ] || false
                                        }
                                        onChange={(e) =>
                                          setSelectedQuestions((prev) => ({
                                            ...prev,
                                            [`l2-${index}-${i}`]:
                                              e.target.checked,
                                          }))
                                        }
                                      />
                                      <label
                                        htmlFor={`l2-checkbox-${index}-${i}`}
                                      >
                                        <strong>Q (Level 2):</strong>{" "}
                                        {q.question}
                                        <br />
                                        <strong>A:</strong> {q.answer}
                                      </label>
                                    </li>
                                  ))}
                                </>
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

            {/* Contact Card */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: -20 },
                visible: { opacity: 1, y: 0 },
              }}
              initial="hidden"
              whileInView="visible"
              transition={{ duration: 1.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="animate_top w-full space-y-6 md:w-2/5 md:p-7.5 lg:w-[26%] xl:pt-15"
            >
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                Reach Us
              </h3>

              {/* Location */}
              <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-4 dark:bg-gray-800">
                <svg
                  className="text-blue-600 dark:text-blue-400"
                  width="20"
                  height="20"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10 2a6 6 0 00-6 6c0 4.5 6 10 6 10s6-5.5 6-10a6 6 0 00-6-6z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Our Location
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    VisionVault HQ, Block D, Jalan Pintar, Kuala Lumpur
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3 rounded-lg bg-green-50 p-4 dark:bg-gray-800">
                <svg
                  className="text-green-600 dark:text-green-400"
                  width="20"
                  height="20"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M2 4l6 4 6-4v10H2V4z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Email Support
                  </h3>
                  <a
                    href="mailto:support@visionvault.edu"
                    className="text-sm text-blue-600 underline dark:text-blue-400"
                  >
                    support@visionvault.edu
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3 rounded-lg bg-yellow-50 p-4 dark:bg-gray-800">
                <svg
                  className="text-yellow-600 dark:text-yellow-400"
                  width="20"
                  height="20"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M3 2a1 1 0 00-1 1v2c0 6.627 5.373 12 12 12h2a1 1 0 001-1v-3.586a1 1 0 00-.293-.707l-3-3a1 1 0 00-1.414 0L12 11a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414l2.293-2.293a1 1 0 000-1.414l-3-3A1 1 0 006.414 1H4a1 1 0 00-1 1z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Call Us
                  </h3>
                  <a
                    href="tel:+60123456789"
                    className="text-sm text-blue-600 underline dark:text-blue-400"
                  >
                    +60 12-345 6789
                  </a>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400">
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
