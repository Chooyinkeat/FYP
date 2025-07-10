import { Metadata } from "next";
import FoundList from "@/components/FoundList";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Found Items | VisionVault",
  description:
    "Browse and search reported found items on VisionVault. Help reunite belongings with their rightful owners through intelligent image recognition and real-time updates.",
};

export default function FoundItemsPage() {
  return (
    <>
      <section className="py-20 lg:py-25 xl:py-30">
        <div className="max-w-c-1280 mx-auto mt-15 px-4 md:px-8 xl:mt-20 xl:px-0">
          <div className="max-w-c-1280 mx-auto mt-15 px-4 md:px-8 xl:mt-20 xl:px-0">
            {/* Wrapper to align search + button */}
            <div className="mb-10 flex flex-col justify-center gap-4 md:flex-row md:items-center">
              {/* Search Form */}
              <form className="w-full max-w-md">
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
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-4 ps-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    placeholder="Search Lost Items..."
                    required
                  />
                  <button
                    type="submit"
                    className="absolute end-2.5 bottom-2.5 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  >
                    Search
                  </button>
                </div>
              </form>

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
              <FoundList />
            </div>
            {/* Pagination */}
            <div className="my-10 flex flex-col justify-center gap-4 md:flex-row md:items-center">
              <nav aria-label="Page navigation example">
                <ul className="inline-flex h-10 -space-x-px text-base">
                  <li>
                    <a
                      href="#"
                      className="ms-0 flex h-10 items-center justify-center rounded-s-lg border border-e-0 border-gray-300 bg-white px-4 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                    >
                      Pre
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="flex h-10 items-center justify-center border border-gray-300 bg-white px-4 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                    >
                      1
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="flex h-10 items-center justify-center border border-gray-300 bg-white px-4 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                    >
                      2
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      aria-current="page"
                      className="flex h-10 items-center justify-center border border-gray-300 bg-blue-50 px-4 text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                    >
                      3
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="flex h-10 items-center justify-center border border-gray-300 bg-white px-4 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                    >
                      4
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="flex h-10 items-center justify-center border border-gray-300 bg-white px-4 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                    >
                      5
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="flex h-10 items-center justify-center rounded-e-lg border border-gray-300 bg-white px-4 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                    >
                      Nex
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
