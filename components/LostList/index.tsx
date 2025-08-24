"use client";

import "swiper/css";
import "swiper/css/pagination";
import axios from "axios";
import Swal from "sweetalert2";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { LostItem } from "@/types/items";
import { Swiper, SwiperSlide } from "swiper/react";
import { debounce } from "lodash";
import { Description } from "@/types/items";

const LostList = () => {
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchLostItems = async () => {
    try {
      const response = await axios.get("/api/protected/getLostItemAPI", {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch lost items.",
      });
    }
  };

  const searchItems = async (category: string) => {
    try {
      const response = await axios.post(
        "/api/protected/searchItemAPI",
        { category },
        { withCredentials: true },
      );
      return response.data;
    } catch (error) {
      console.log("Error searching items:", error);
    }
  };

  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.trim() === "") {
        const data = await fetchLostItems();
        if (data?.success) {
          setLostItems(data.lostItems);
        }
        return;
      }

      const data = await searchItems(query);
      if (data?.success) {
        console.log("Search results: ", data.data);
        setLostItems(data.data);
      } else {
        setLostItems([]);
      }
    }, 500), // 500ms debounce delay
    [],
  );

  useEffect(() => {
    fetchLostItems()
      .then((data) => {
        if (data?.success && data.lostItems.length > 0) {
          setLostItems(data.lostItems);
        } else {
          Swal.fire({
            icon: "info",
            title: "No Lost Items",
            text: "There are currently no lost items available.",
          });
        }
      })
      .catch((error) => {
        console.log("Error fetching lost items:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An error occurred while fetching lost items.",
        });
      });
  }, []);

  useEffect(() => {
    const status = sessionStorage.getItem("status");
    if (status === "1") {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "You have been warned once. If you perform a fake claim again, your account will be banned.",
      });
    } else if (status === "2") {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "You have been warned twice. If you perform a fake claim again, your account will be banned.",
      });
    }
  }, []);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return (
    <>
      {/* Wrapper to align search + button */}
      <div className="mb-10 flex flex-col justify-center gap-4 md:flex-row md:items-center">
        <div className="w-full max-w-md">
          <label
            htmlFor="default-search"
            className="sr-only mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Search
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
              <svg
                className="h-4 w-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
            </div>
            <input
              type="search"
              id="default-search"
              name="category"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                debouncedSearch(e.target.value);
              }}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-4 ps-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              placeholder="Search Lost Items..."
              required
            />
          </div>
        </div>

        {/* Submit Lost Item Button */}
        <div className="flex justify-end md:justify-end">
          <Link
            href="/submitItem"
            className="inline-block cursor-pointer rounded-lg bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700"
          >
            Submit Lost Item
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-7.5 md:grid-cols-2 lg:grid-cols-3 xl:gap-10">
        {lostItems.map((item, index) => {
          let parsedDescription: Description | null = null;

          try {
            parsedDescription = JSON.parse(item.description);
          } catch (err) {
            console.log(
              "Failed to parse item.description at index",
              index,
              err,
            );
          }

          return (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: -20 },
                visible: { opacity: 1, y: 0 },
              }}
              initial="hidden"
              whileInView="visible"
              transition={{ duration: 1, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="animate_top flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:shadow-none"
            >
              <Link
                href={{
                  pathname: "/lostItems/lostItems-details",
                  query: {
                    id: item.lostId,
                  },
                }}
                className="group relative block aspect-[368/239]"
              >
                <Swiper
                  pagination={{ clickable: true }}
                  className="h-full w-full cursor-pointer"
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
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </Link>

              <div className="flex flex-1 flex-col px-6 py-5">
                <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-black dark:text-white">
                  Category : {item.category || "Unknown Category"}
                </h3>
                <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    Location:
                  </span>
                  <span className="ml-1">
                    {parsedDescription?.location
                      ? parsedDescription.location.length > 50
                        ? parsedDescription.location.slice(0, 50) + "..."
                        : parsedDescription.location
                      : "Unknown Location"}
                  </span>
                </p>

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={async () => {
                      const itemUrl = `${window.location.origin}/lostItems/lostItems-details?id=${item.lostId}`;
                      try {
                        await navigator.clipboard.writeText(itemUrl);
                        Swal.fire({
                          icon: "success",
                          title: "URL Copied!",
                          text: "Item URL copied to clipboard! You can now paste it in the chat.",
                          timer: 2000,
                          showConfirmButton: false,
                        });
                      } catch (err) {
                        console.error("Failed to copy URL:", err);
                        Swal.fire({
                          icon: "error",
                          title: "Copy Failed",
                          text: "Failed to copy URL to clipboard",
                        });
                      }
                    }}
                    className="cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition not-last:inline-flex hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 focus:outline-none active:scale-95 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
                  >
                    Copy and Share
                  </button>
                  <Link
                    href={{
                      pathname: "/lostItems/lostItems-details",
                      query: {
                        id: item.lostId,
                      },
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 focus:outline-none dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
                  >
                    <svg
                      className="h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-5.2-5.2M11 17a6 6 0 1 1 0-12 6 6 0 0 1 0 12z"
                      />
                    </svg>
                    View details
                  </Link>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </>
  );
};

export default LostList;
