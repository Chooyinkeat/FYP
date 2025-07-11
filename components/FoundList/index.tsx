"use client";
import axios from "axios";
import Swal from "sweetalert2";
import Image from "next/image";
import Link from "next/link";
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
          className="animate_top shadow-solid-8 dark:bg-blacksection rounded-lg bg-white p-4 pb-9"
        >
          <div className="relative block aspect-368/239">
            <Image
              src="/images/blog/img_1.webp"
              alt={"Found item"}
              fill
              className="rounded-md object-cover"
            />
          </div>

          <div className="px-4">
            <h3 className="hover:text-primary dark:hover:text-primary xl:text-itemtitle2 mt-7.5 mb-3.5 line-clamp-2 inline-block text-lg font-medium text-black duration-300 dark:text-white">
              <Link href={`/blog/blog-details/${index}`}>
                {item.question[0]?.metadata.item_type || "Unknown Item"}
              </Link>
            </h3>
            <p className="line-clamp-3">
              {item.question[0]?.questions[0]?.question ||
                "No question available"}
            </p>
            <div className="mt-5 flex items-center justify-between lg:mt-7 xl:mt-6">
              <button
                type="button"
                className="me-2 inline-flex cursor-pointer items-center rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
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
                Verify Item
              </button>
              <button
                type="button"
                className="inline-flex cursor-pointer items-center rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Alert Founder
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
      ))}
    </>
  );
};

export default FoundList;
