import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Warning - Lost and Found System",
  description: "Warning page for Lost and Found System",
};

const WarningPage = () => {
  return (
    <section className="overflow-hidden pt-45 pb-25 lg:pt-50 lg:pb-32.5 xl:pt-55 xl:pb-37.5">
      <div className="animate_top mx-auto max-w-[518px] text-center">
        <h2 className="mb-5 text-2xl font-semibold text-yellow-600 md:text-4xl dark:text-yellow-400">
          Action Not Allowed
        </h2>

        <p className="mb-7.5 text-gray-700 dark:text-gray-300">
          You can no longer{" "}
          <span className="font-semibold">claim a found item</span>
          or <span className="font-semibold">submit a new item</span>. Please
          contact the administrator if you believe this is a mistake.
        </p>

        <a
          href="/"
          className="dark:bg-btndark inline-flex items-center gap-2.5 rounded-full bg-yellow-600 px-6 py-3 font-medium text-white duration-300 ease-in-out hover:bg-yellow-700 dark:hover:bg-yellow-600"
        >
          Return to Dashboard
          <svg
            className="fill-white"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10.4767 6.16664L6.00668 1.69664L7.18501 0.518311L13.6667 6.99998L7.18501 13.4816L6.00668 12.3033L10.4767 7.83331H0.333344V6.16664H10.4767Z" />
          </svg>
        </a>
      </div>
    </section>
  );
};

export default WarningPage;
