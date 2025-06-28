"use client";
import Link from "next/link";

const SidebarLink = () => {
  return (
    <>
      <li className="block">
        <Link
          href={`/docs/introduction`}
          className={`bg-stroke dark:bg-blackho flex w-full rounded-xs px-3 py-2 text-base text-black dark:text-white`}
        >
          Project Introduction
        </Link>
        <Link
          href={`/docs/system-features`}
          className={`flex w-full rounded-xs px-3 py-2 text-base text-black dark:text-white`}
        >
          System Features & User Flow
        </Link>
        <Link
          href={`/docs/ai-image-matching`}
          className={`flex w-full rounded-xs px-3 py-2 text-base text-black dark:text-white`}
        >
          AI Image Matching
        </Link>
        <Link
          href={`/docs/technical-stack`}
          className={`flex w-full rounded-xs px-3 py-2 text-base text-black dark:text-white`}
        >
          Tech Stack & Architecture
        </Link>
      </li>
    </>
  );
};

export default SidebarLink;
