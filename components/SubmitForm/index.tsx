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
      console.log("Results : ", response.data.data);
      const nonItemEntries = aiData.filter(
        (item: any) => item.category === "Non-Item",
      );

      if (nonItemEntries.length > 0) {
        Swal.close();
        alert("The image submitted is not item");
        return;
      }

      const aiDataWithPreview = aiData.map((item: any, index: number) => ({
        ...item,
        previewUrl: URL.createObjectURL(files[index]),
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
                <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 backdrop-blur-sm duration-300 sm:p-4">
                  <div className="animate-in slide-in-from-bottom-4 relative flex max-h-[95vh] w-full max-w-xs flex-col rounded-2xl bg-white/95 p-4 shadow-2xl ring-1 ring-gray-200/50 backdrop-blur-xl duration-500 sm:max-h-[90vh] sm:max-w-sm sm:rounded-3xl sm:p-6 md:max-w-2xl md:p-8 lg:max-w-3xl xl:max-w-4xl dark:bg-gray-900/95 dark:ring-gray-700/50">
                    {/* Header with Close Button */}
                    <div className="mb-6 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-2">
                          <svg
                            className="h-5 w-5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h2 className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-xl font-bold text-transparent sm:text-2xl dark:from-white dark:to-gray-300">
                            AI Analysis Results
                          </h2>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Review and select verification questions
                          </p>
                        </div>
                      </div>
                      <button
                        className="group relative rounded-xl bg-gray-100 p-2 transition-all duration-200 hover:bg-red-50 focus:bg-red-50 focus:ring-2 focus:ring-red-500/20 focus:outline-none dark:bg-gray-800 dark:hover:bg-red-900/20 dark:focus:bg-red-900/20"
                        onClick={() => setShowModal(false)}
                        aria-label="Close modal"
                      >
                        <svg
                          className="h-5 w-5 text-gray-400 transition-colors duration-200 group-hover:text-red-500 group-focus:text-red-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Carousel Content - Enhanced Design */}
                    <div className="mb-4 flex-1 overflow-hidden">
                      <div className="relative h-[450px] sm:h-[500px] md:h-[550px]">
                        {aiResponses.map((res, index) => (
                          <div
                            key={index}
                            className={`absolute inset-0 transform transition-all duration-700 ease-out ${
                              index === currentIndex
                                ? "z-10 translate-x-0 scale-100 opacity-100"
                                : index < currentIndex
                                ? "z-0 -translate-x-full scale-95 opacity-0"
                                : "z-0 translate-x-full scale-95 opacity-0"
                            }`}
                            data-carousel-item
                          >
                            <div className="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent h-full overflow-y-auto pb-6">
                              <div className="space-y-6 pr-2">
                                {/* Image Section */}
                                <div className="group relative">
                                  <div className="relative rounded-2xl bg-white p-4 shadow-lg ring-1 ring-gray-200/50 dark:bg-gray-800 dark:ring-gray-700/50">
                                    <img
                                      src={res.previewUrl}
                                      alt={res.filename}
                                      className="max-h-32 w-full rounded-xl object-contain sm:max-h-40 md:max-h-48"
                                    />
                                  </div>
                                </div>

                                {/* Metadata Cards */}
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                  <div className="rounded-xl border border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-teal-50 p-4 dark:border-emerald-700/50 dark:from-emerald-900/20 dark:to-teal-900/20">
                                    <div className="mb-2 flex items-center space-x-2">
                                      <div className="rounded-lg bg-emerald-500 p-1.5">
                                        <svg
                                          className="h-3 w-3 text-white"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                          />
                                        </svg>
                                      </div>
                                      <span className="text-xs font-semibold tracking-wide text-emerald-700 uppercase dark:text-emerald-300">
                                        Item Type
                                      </span>
                                    </div>
                                    <p className="text-sm font-medium break-words text-emerald-900 dark:text-emerald-100">
                                      {res.metadata.item_type}
                                    </p>
                                  </div>

                                  <div className="rounded-xl border border-amber-200/50 bg-gradient-to-br from-amber-50 to-orange-50 p-4 dark:border-amber-700/50 dark:from-amber-900/20 dark:to-orange-900/20">
                                    <div className="mb-2 flex items-center space-x-2">
                                      <div className="rounded-lg bg-amber-500 p-1.5">
                                        <svg
                                          className="h-3 w-3 text-white"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
                                          />
                                        </svg>
                                      </div>
                                      <span className="text-xs font-semibold tracking-wide text-amber-700 uppercase dark:text-amber-300">
                                        Color
                                      </span>
                                    </div>
                                    <p className="text-sm font-medium break-words text-amber-900 dark:text-amber-100">
                                      {res.metadata.color}
                                    </p>
                                  </div>

                                  <div className="rounded-xl border border-purple-200/50 bg-gradient-to-br from-purple-50 to-pink-50 p-4 dark:border-purple-700/50 dark:from-purple-900/20 dark:to-pink-900/20">
                                    <div className="mb-2 flex items-center space-x-2">
                                      <div className="rounded-lg bg-purple-500 p-1.5">
                                        <svg
                                          className="h-3 w-3 text-white"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                          />
                                        </svg>
                                      </div>
                                      <span className="text-xs font-semibold tracking-wide text-purple-700 uppercase dark:text-purple-300">
                                        Brand
                                      </span>
                                    </div>
                                    <p className="text-sm font-medium break-words text-purple-900 dark:text-purple-100">
                                      {res.metadata.brand}
                                    </p>
                                  </div>

                                  <div className="rounded-xl border border-rose-200/50 bg-gradient-to-br from-rose-50 to-red-50 p-4 dark:border-rose-700/50 dark:from-rose-900/20 dark:to-red-900/20">
                                    <div className="mb-2 flex items-center space-x-2">
                                      <div className="rounded-lg bg-rose-500 p-1.5">
                                        <svg
                                          className="h-3 w-3 text-white"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                                          />
                                        </svg>
                                      </div>
                                      <span className="text-xs font-semibold tracking-wide text-rose-700 uppercase dark:text-rose-300">
                                        Material
                                      </span>
                                    </div>
                                    <p className="text-sm font-medium break-words text-rose-900 dark:text-rose-100">
                                      {res.metadata.material}
                                    </p>
                                  </div>
                                </div>
                                {/* Verification Questions Section */}
                                <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-200/50 dark:bg-gray-800 dark:ring-gray-700/50">
                                  <div className="mb-6 flex items-center space-x-3">
                                    <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5">
                                      <svg
                                        className="h-5 w-5 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                      </svg>
                                    </div>
                                    <div>
                                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                        Verification Questions
                                      </h3>
                                      <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Select questions to include in your
                                        listing
                                      </p>
                                    </div>
                                  </div>

                                  <div className="space-y-4">
                                    {/* Level 1 Questions */}
                                    {res.questions.level_1.map((q, i) => (
                                      <div
                                        key={`l1-${i}`}
                                        className="group relative rounded-xl border border-blue-200/50 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 transition-all duration-200 hover:shadow-md dark:border-blue-700/50 dark:from-blue-900/20 dark:to-indigo-900/20"
                                      >
                                        <div className="flex items-start space-x-4">
                                          <div className="mt-1 flex-shrink-0">
                                            <input
                                              type="checkbox"
                                              id={`l1-checkbox-${index}-${i}`}
                                              className="h-5 w-5 rounded-lg border-2 border-blue-300 bg-white text-blue-600 transition-all duration-200 hover:border-blue-400 focus:ring-2 focus:ring-blue-500 dark:border-blue-500 dark:bg-gray-700"
                                              checked={
                                                selectedQuestions[
                                                  `l1-${index}-${i}`
                                                ] || false
                                              }
                                              onChange={(e) =>
                                                setSelectedQuestions(
                                                  (prev) => ({
                                                    ...prev,
                                                    [`l1-${index}-${i}`]:
                                                      e.target.checked,
                                                  }),
                                                )
                                              }
                                            />
                                          </div>
                                          <label
                                            htmlFor={`l1-checkbox-${index}-${i}`}
                                            className="flex-1 cursor-pointer"
                                          >
                                            <div className="mb-3">
                                              <div className="mb-2 flex items-center space-x-2">
                                                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                                                  Level 1
                                                </span>
                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                  Basic Verification
                                                </span>
                                              </div>
                                              <p className="text-sm leading-relaxed font-medium text-gray-900 dark:text-gray-100">
                                                <span className="font-semibold text-blue-600 dark:text-blue-400">
                                                  Q:
                                                </span>{" "}
                                                <span className="break-words">
                                                  {q.question}
                                                </span>
                                              </p>
                                            </div>
                                            <div className="rounded-lg border border-green-200/50 bg-green-50 p-3 dark:border-green-700/50 dark:bg-green-900/20">
                                              <p className="text-sm text-green-800 dark:text-green-200">
                                                <span className="font-semibold text-green-600 dark:text-green-400">
                                                  Correct Answer:
                                                </span>{" "}
                                                <span className="font-medium break-words">
                                                  {q.answer}
                                                </span>
                                              </p>
                                            </div>
                                          </label>
                                        </div>
                                      </div>
                                    ))}

                                    {/* Level 2 Questions */}
                                    {res.questions.level_2.map((q, i) => (
                                      <div
                                        key={`l2-${i}`}
                                        className="group relative rounded-xl border border-purple-200/50 bg-gradient-to-r from-purple-50 to-pink-50 p-4 transition-all duration-200 hover:shadow-md dark:border-purple-700/50 dark:from-purple-900/20 dark:to-pink-900/20"
                                      >
                                        <div className="flex items-start space-x-4">
                                          <div className="mt-1 flex-shrink-0">
                                            <input
                                              type="checkbox"
                                              id={`l2-checkbox-${index}-${i}`}
                                              className="h-5 w-5 rounded-lg border-2 border-purple-300 bg-white text-purple-600 transition-all duration-200 hover:border-purple-400 focus:ring-2 focus:ring-purple-500 dark:border-purple-500 dark:bg-gray-700"
                                              checked={
                                                selectedQuestions[
                                                  `l2-${index}-${i}`
                                                ] || false
                                              }
                                              onChange={(e) =>
                                                setSelectedQuestions(
                                                  (prev) => ({
                                                    ...prev,
                                                    [`l2-${index}-${i}`]:
                                                      e.target.checked,
                                                  }),
                                                )
                                              }
                                            />
                                          </div>
                                          <label
                                            htmlFor={`l2-checkbox-${index}-${i}`}
                                            className="flex-1 cursor-pointer"
                                          >
                                            <div className="mb-3">
                                              <div className="mb-2 flex items-center space-x-2">
                                                <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
                                                  Level 2
                                                </span>
                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                  Advanced Verification
                                                </span>
                                              </div>
                                              <p className="text-sm leading-relaxed font-medium text-gray-900 dark:text-gray-100">
                                                <span className="font-semibold text-purple-600 dark:text-purple-400">
                                                  Q:
                                                </span>{" "}
                                                <span className="break-words">
                                                  {q.question}
                                                </span>
                                              </p>
                                            </div>
                                            <div className="rounded-lg border border-green-200/50 bg-green-50 p-3 dark:border-green-700/50 dark:bg-green-900/20">
                                              <p className="text-sm text-green-800 dark:text-green-200">
                                                <span className="font-semibold text-green-600 dark:text-green-400">
                                                  Answer:
                                                </span>{" "}
                                                <span className="font-medium break-words">
                                                  {q.answer}
                                                </span>
                                              </p>
                                            </div>
                                          </label>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Carousel Controls with Integrated Confirm Button */}
                    <div className="flex items-center justify-between gap-3 px-2">
                      {/* Left: Previous Button */}
                      <button
                        type="button"
                        className="group flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-gray-100 to-gray-200 shadow-md transition-all duration-200 hover:from-gray-200 hover:to-gray-300 hover:shadow-lg focus:from-gray-200 focus:to-gray-300 focus:ring-2 focus:ring-blue-500/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:from-gray-700 dark:to-gray-800 dark:hover:from-gray-600 dark:hover:to-gray-700 dark:focus:from-gray-600 dark:focus:to-gray-700"
                        onClick={() =>
                          setCurrentIndex((prev) =>
                            prev > 0 ? prev - 1 : aiResponses.length - 1,
                          )
                        }
                        disabled={aiResponses.length <= 1}
                        aria-label="Previous"
                      >
                        <svg
                          className="h-4 w-4 text-gray-600 transition-colors duration-200 group-hover:text-gray-800 group-focus:text-gray-800 dark:text-gray-300 dark:group-hover:text-gray-100 dark:group-focus:text-gray-100"
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

                      {/* Center: Counter and Dots + Confirm Button */}
                      <div className="flex flex-1 items-center justify-center gap-4">
                        <div className="flex items-center space-x-3">
                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 sm:text-sm dark:bg-gray-800 dark:text-gray-300">
                            {currentIndex + 1} of {aiResponses.length}
                          </span>
                          {aiResponses.length > 1 && (
                            <div className="flex space-x-1.5">
                              {aiResponses.map((_, index) => (
                                <button
                                  key={index}
                                  onClick={() => setCurrentIndex(index)}
                                  className={`h-2 w-2 rounded-full transition-all duration-300 hover:scale-125 ${
                                    index === currentIndex
                                      ? "bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg"
                                      : "bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500"
                                  }`}
                                  aria-label={`Go to image ${index + 1}`}
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Confirm Button */}
                        <button
                          onClick={() => {
                            handleConfirmUpload();
                          }}
                          className="group relative transform overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 px-3 py-1.5 text-xs font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 hover:shadow-xl focus:from-blue-700 focus:via-purple-700 focus:to-blue-800 focus:ring-2 focus:ring-blue-500/50 focus:outline-none sm:px-4 sm:py-2 sm:text-sm"
                        >
                          <span className="absolute inset-0 origin-left scale-x-0 transform bg-white/20 transition-transform duration-300 group-hover:scale-x-100"></span>
                          <span className="relative flex items-center justify-center gap-1.5">
                            <svg
                              className="h-3 w-3 transition-transform duration-200 group-hover:scale-110 sm:h-4 sm:w-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Confirm
                          </span>
                        </button>
                      </div>

                      {/* Right: Next Button + Close Button */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="group flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-gray-100 to-gray-200 shadow-md transition-all duration-200 hover:from-gray-200 hover:to-gray-300 hover:shadow-lg focus:from-gray-200 focus:to-gray-300 focus:ring-2 focus:ring-blue-500/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:from-gray-700 dark:to-gray-800 dark:hover:from-gray-600 dark:hover:to-gray-700 dark:focus:from-gray-600 dark:focus:to-gray-700"
                          onClick={() =>
                            setCurrentIndex((prev) =>
                              prev < aiResponses.length - 1 ? prev + 1 : 0,
                            )
                          }
                          disabled={aiResponses.length <= 1}
                          aria-label="Next"
                        >
                          <svg
                            className="h-4 w-4 text-gray-600 transition-colors duration-200 group-hover:text-gray-800 group-focus:text-gray-800 dark:text-gray-300 dark:group-hover:text-gray-100 dark:group-focus:text-gray-100"
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
