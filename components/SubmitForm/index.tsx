"use client";

import { motion } from "framer-motion";
import NextImage from "next/image";
import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Swal from "sweetalert2";
import axios from "axios";

const Submit = () => {
  const [status, setStatus] = useState("Lost");
  const [category, setCategory] = useState("");
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

  // convert file to images
  // Utility to convert file to <img> element
  const createImageElement = (file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = () => {
        img.src = reader.result as string;
      };

      img.onload = () => resolve(img);
      img.onerror = reject;

      reader.readAsDataURL(file);
    });
  };

  // submit form handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!category || !location || files.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Form",
        text: "Please fill all fields and upload at least one image.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("category", category);
    formData.append("status", status);

    files.forEach((file) => {
      formData.append("images", file); // backend should expect "images" as an array
    });

    try {
      const response = await axios.post("/api/protected/upload", formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.status !== 200) {
        throw new Error("Failed to upload files");
      }

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Your data has been submitted!",
      });

      // Reset form
      setCategory("");
      setStatus("Lost");
      setFiles([]);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: "Something went wrong. Please try again later.",
      });
      console.log(err);
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
                <div className="mb-7.5 flex flex-col gap-7.5 lg:flex-row lg:justify-between lg:gap-14">
                  {/* Category */}
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
                  {/* Location
                  <input
                    type="text"
                    value={location} // ✅ binds the state to the input
                    onChange={(e) => setLocation(e.target.value)} //
                    placeholder="Location"
                    className="border-stroke focus:border-waterloo dark:border-strokedark dark:focus:border-manatee w-full border-b bg-transparent pb-3.5 focus:placeholder:text-black focus-visible:outline-hidden lg:w-1/2 dark:focus:placeholder:text-white"
                    name="location"
                  /> */}
                </div>
                <div className="mb-12.5 flex flex-col gap-7.5 lg:flex-row lg:justify-between lg:gap-14">
                  <div className="w-1/2">
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
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                  <div className="w-1/2"></div>
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
              </form>
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
