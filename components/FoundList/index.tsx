"use client";
import axios from "axios";
import Swal from "sweetalert2";
import Link from "next/link";
import "swiper/css";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FoundItem } from "@/types/items";
import { debounce } from "lodash";
import { useState, useEffect, useCallback } from "react";

const fetchFoundItems = async () => {
  try {
    const response = await axios.get("/api/protected/getFoundAPI", {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to fetch found items.",
    });
  }
};

const FoundList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);

  const searchItems = async (category: string) => {
    try {
      const response = await axios.post(
        "/api/protected/searchFoundItemAPI",
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
        const data = await fetchFoundItems();
        if (data?.success) {
          setFoundItems(data.foundItems);
        }
        return;
      }

      const data = await searchItems(query);
      if (data?.success) {
        setFoundItems(data.data);
      } else {
        setFoundItems([]);
      }
    }, 500), // 500ms debounce delay
    [],
  );

  useEffect(() => {
    fetchFoundItems()
      .then((data) => {
        if (data?.success && data.foundItems.length > 0) {
          console.log("Found item: ", data.foundItems);
          setFoundItems(data.foundItems);
        } else {
          Swal.fire({
            icon: "info",
            title: "No Found Items",
            text: "There are currently no found items available.",
          });
        }
      })
      .catch((error) => {
        console.log("Error fetching found items:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An error occurred while fetching found items.",
        });
      });
  }, []);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const convertDate = (date: string) => {
    const d = new Date(date);
    const readableDate = d.toLocaleDateString("en-MY", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return readableDate;
  };

  const convertTime = (time: string) => {
    const today = new Date(); // Use today's date
    const [hours, minutes, seconds] = time.split(":");
    today.setHours(Number(hours), Number(minutes), Number(seconds || 0));
    return today.toLocaleTimeString("en-MY", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true, // Set to false if you want 24-hour format
    });
  };

  return (
    <>
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
        {foundItems.map((item, index) => (
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
            className="animate_top overflow-hidden rounded-2xl border border-gray-100 bg-white p-0 shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:shadow-none"
          >
            <div className="relative aspect-[368/239] w-full">
              <Swiper
                pagination={{ clickable: true }}
                className="h-full w-full cursor-pointer"
              >
                {(item.show_img === 1 && item.image_url.length > 0
                  ? item.image_url
                  : ["/images/blog/img_1.webp"]
                ) // fallback
                  .map((imgUrl, i) => (
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
            </div>

            <div className="px-6 py-5">
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Category:
                  <span className="ml-1 font-semibold text-gray-800 dark:text-gray-100">
                    {item.category || "Unknown Category"}
                  </span>
                </p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Location:
                  <span className="ml-1 font-semibold text-gray-800 dark:text-gray-100">
                    {item.location || "Unknown Location"}
                  </span>
                </p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Date:
                  <span className="ml-1 font-semibold text-gray-800 dark:text-gray-100">
                    {convertDate(item.date) || "N/A"}
                  </span>
                </p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Time:
                  <span className="ml-1 font-semibold text-gray-800 dark:text-gray-100">
                    {convertTime(item.time) || "N/A"}
                  </span>
                </p>
              </div>
              <div className="mt-6 flex justify-between">
                <button
                  onClick={async () => {
                    const itemUrl = `${
                      window.location.origin
                    }/foundItems/claimItemForm?foundId=${encodeURIComponent(
                      item.foundId,
                    )}&location=${encodeURIComponent(
                      item.location,
                    )}&date=${encodeURIComponent(
                      convertDate(item.date),
                    )}&time=${encodeURIComponent(
                      convertTime(item.time),
                    )}&category=${encodeURIComponent(
                      item.category,
                    )}&userId=${encodeURIComponent(
                      item.userId,
                    )}&show_img=${encodeURIComponent(
                      item.show_img,
                    )}&image_url=${encodeURIComponent(
                      JSON.stringify(item.image_url),
                    )}`;
                    try {
                      await navigator.clipboard.writeText(itemUrl);
                      Swal.fire({
                        icon: "success",
                        title: "URL Copied!",
                        text: "Found item URL copied to clipboard! You can now paste it in the chat.",
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
                  href={`/foundItems/claimItemForm?foundId=${encodeURIComponent(
                    item.foundId,
                  )}&location=${encodeURIComponent(
                    item.location,
                  )}&date=${encodeURIComponent(
                    convertDate(item.date),
                  )}&time=${encodeURIComponent(
                    convertTime(item.time),
                  )}&category=${encodeURIComponent(
                    item.category,
                  )}&userId=${encodeURIComponent(
                    item.userId,
                  )}&show_img=${encodeURIComponent(
                    item.show_img,
                  )}&image_url=${encodeURIComponent(
                    JSON.stringify(item.image_url),
                  )}`}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 focus:outline-none dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
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
                  Claim Item
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
};

export default FoundList;
