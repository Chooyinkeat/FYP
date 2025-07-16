"use client";
import axios from "axios";
import Swal from "sweetalert2";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { FoundItem } from "@/types/items";
const FoundList = () => {
  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);

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

  useEffect(() => {
    fetchFoundItems()
      .then((data) => {
        if (data?.success && data.foundItems.length > 0) {
          console.log("Found items fetched successfully: ", data.foundItems);
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

  return (
    <>
      <div className="md:item-end mb-10 flex flex-col justify-end gap-4 md:flex-row">
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
              <Image
                src="/images/blog/img_1.webp"
                alt="Found item"
                fill
                className="rounded-t-2xl object-cover"
                sizes="(max-width: 768px) 100vw, 368px"
                priority
              />
            </div>
            <div className="px-6 py-5">
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Location:
                  <span className="ml-1 font-semibold text-gray-800 dark:text-gray-100">
                    {item.question[0]?.location || "Unknown Location"}
                  </span>
                </p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Date:
                  <span className="ml-1 font-semibold text-gray-800 dark:text-gray-100">
                    {item.question[0]?.date || "N/A"}
                  </span>
                </p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Time:
                  <span className="ml-1 font-semibold text-gray-800 dark:text-gray-100">
                    {item.question[0]?.time || "N/A"}
                  </span>
                </p>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 focus:outline-none dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
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
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
};

export default FoundList;
