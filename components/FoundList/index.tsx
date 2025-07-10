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
          <Link
            href={`/blog/${index}`}
            className="relative block aspect-368/239"
          >
            <Image
              src={item.imageUrl[0]} // ✅ Use first image
              alt={item.question[0]?.metadata.item_type || "Found item"}
              fill
              className="rounded-md object-cover"
            />
          </Link>

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
          </div>
        </motion.div>
      ))}
    </>
  );
};

export default FoundList;
