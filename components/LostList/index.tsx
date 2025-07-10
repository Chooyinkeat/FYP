"use client";

import axios from "axios";
import Swal from "sweetalert2";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { LostItem } from "@/types/items";

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
              href={`/blog/${index}`}
              className="relative block aspect-[368/239]"
            >
              <Image
                src={item.imageUrl[0] || "/placeholder.png"} // optional fallback
                alt={parsedDescription?.category || "Lost item"}
                fill
                className="rounded-md object-cover"
              />
            </Link>

            <div className="px-4">
              <h3 className="hover:text-primary dark:hover:text-primary xl:text-itemtitle2 mt-7.5 mb-3.5 line-clamp-2 inline-block text-lg font-medium text-black duration-300 dark:text-white">
                <Link href={`/blog/blog-details/${index}`}>
                  {parsedDescription?.category || "Unknown Category"}
                </Link>
              </h3>
              <p className="line-clamp-3">
                {parsedDescription?.description || "No description available"}
              </p>
            </div>
          </motion.div>
        );
      })}
    </>
  );
};

export default LostList;
