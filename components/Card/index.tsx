"use client";
import axios from "axios";
import Image from "next/image";
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import { FoundItem } from "@/types/items";
import Swal from "sweetalert2";
import Link from "next/link";

interface CardProps {
  foundId: number;
}

const getFoundItemDetails = async (foundId: number) => {
  try {
    const response = await axios.post(
      "/api/protected/getFoundAPI/getFoundDetailsAPI",
      { foundId: foundId },
      {
        withCredentials: true,
      },
    );
    return response.data.data;
  } catch (error) {
    console.log("Error fetching found item details:", error);
    return [];
  }
};

const convertDate = (date: string) => {
  const d = new Date(date); // Keep the full ISO string to preserve timezone
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

const Card = ({ foundId }: CardProps) => {
  // Set state
  const [foundItem, setFoundItem] = useState<FoundItem | null>(null);

  useEffect(() => {
    if (!foundId) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Found ID is required to fetch item details.",
      });
      return;
    }
    getFoundItemDetails(foundId)
      .then((data) => {
        setFoundItem(data[0]);
      })
      .catch((error) => {
        console.log("Error fetching found items:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An error occurred while fetching found items.",
        });
      });
  }, [foundId]);

  if (!foundItem) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.2 }}
      className="w-full px-4 lg:w-1/4"
    >
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
        {/* Image */}
        <div className="relative aspect-[4/3] w-full">
          <Image
            src="/images/blog/img_1.webp"
            alt="Found item"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 368px"
          />
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Category:
              <span className="ml-1 font-semibold text-gray-800 dark:text-gray-100">
                {/* category */}
                {foundItem?.category || "Unknown"}
              </span>
            </p>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Location:
              <span className="ml-1 font-semibold text-gray-800 dark:text-gray-100">
                {foundItem?.location || "Unknown"}
              </span>
            </p>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Date:
              <span className="ml-1 font-semibold text-gray-800 dark:text-gray-100">
                {foundItem?.date || "Unknown"}
              </span>
            </p>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Time:
              <span className="ml-1 font-semibold text-gray-800 dark:text-gray-100">
                {foundItem?.time || "Unknown"}
              </span>
            </p>
          </div>

          <Link
            href={`/foundItems/claimItemForm?foundId=${encodeURIComponent(
              foundItem.foundId,
            )}&location=${encodeURIComponent(
              foundItem.location,
            )}&date=${encodeURIComponent(
              convertDate(foundItem.date),
            )}&time=${encodeURIComponent(
              convertTime(foundItem.time),
            )}&category=${encodeURIComponent(
              foundItem.category,
            )}&userId=${encodeURIComponent(foundItem.userId)}`}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-semibold text-white shadow transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 focus:outline-none dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
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
};
export default Card;
