"use client";
import { Blog } from "@/types/blog";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const BlogItem = ({ blog }: { blog: Blog }) => {
  const { mainImage, title, metadata } = blog;
  return (
    <>
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
        transition={{ duration: 1, delay: 0.5 }}
        viewport={{ once: true }}
        className="animate_top shadow-solid-8 dark:bg-blacksection rounded-lg bg-white p-4 pb-9"
      >
        <Link href={`/blog/`} className="relative block aspect-368/239">
          <Image src={mainImage} alt={title} fill />
        </Link>

        <div className="px-4">
          <h3 className="hover:text-primary dark:hover:text-primary xl:text-itemtitle2 mt-7.5 mb-3.5 line-clamp-2 inline-block text-lg font-medium text-black duration-300 dark:text-white">
            <Link href={`/blog/blog-details`}>
              {`${title.slice(0, 40)}...`}
            </Link>
          </h3>
          <p className="line-clamp-3">{metadata}</p>
        </div>
      </motion.div>
    </>
  );
};

export default BlogItem;
