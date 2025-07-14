"use client";

import axios from "axios";
import Swal from "sweetalert2";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { LostItem } from "@/types/items";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";

const LostList = () => {
  const [lostItems, setLostItems] = useState<LostItem[]>([]);

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

  useEffect(() => {
    fetchLostItems()
      .then((data) => {
        console.log("Lost Items Data: ", data);
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

  return (
    <>
      {lostItems.map((item, index) => {
        let parsedDescription: {
          category: string;
          location: string;
          description: string;
          date: string;
          time: string;
        } | null = null;

        try {
          parsedDescription = JSON.parse(item.description);
        } catch (err) {
          console.log("Failed to parse item.description at index", index, err);
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
            className="animate_top shadow-solid-8 dark:bg-blacksection rounded-lg bg-white p-4 pb-9"
          >
            <Link
              href="/lostItems/lostItems-details"
              className="relative block aspect-[368/239]"
              onClick={() => {
                localStorage.setItem("selectedLostItem", JSON.stringify(item));
              }}
            >
              <Swiper
                pagination={{ clickable: true }}
                className="h-full w-full rounded-md"
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
            </Link>

            <div className="px-4">
              <h3 className="hover:text-primary dark:hover:text-primary xl:text-itemtitle2 mt-7.5 mb-3.5 line-clamp-2 inline-block text-lg font-medium text-black duration-300 dark:text-white">
                <Link href="#">
                  Category : {parsedDescription?.category || "Unknown Category"}
                </Link>
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Location: {parsedDescription?.location || "Unknown Location"}
              </p>
              <div className="mt-5 flex items-center justify-between lg:mt-7 xl:mt-6">
                <Link
                  href="/lostItems/lostItems-details"
                  className="me-2 inline-flex cursor-pointer items-center rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  onClick={() => {
                    localStorage.setItem(
                      "selectedLostItem",
                      JSON.stringify(item),
                    );
                  }}
                >
                  <svg
                    className="me-2 h-4 w-4"
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
                <button
                  type="button"
                  className="inline-flex cursor-pointer items-center rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  Alert Owner
                  <svg
                    className="ms-2 h-4 w-4 rtl:rotate-180"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14V11a6 6 0 1 0-12 0v3c0 .538-.214 1.055-.595 1.595L4 17h5m6 0a3 3 0 1 1-6 0h6z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </>
  );
};

export default LostList;
