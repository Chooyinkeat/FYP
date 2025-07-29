"use client";
import axios from "axios";
import Link from "next/link";
import { useState, useEffect } from "react";
import { FoundItemTable, LostItemTable } from "@/types/items";

const fetchItems = async (type) => {
  try {
    const response = await axios.post(
      "/api/protected/getSubmittedItemAPI",
      {
        type: type,
      },
      { withCredentials: true },
    );
    return response.data;
  } catch (error) {
    console.log("Error fetching items:", error);
    return { success: false, message: "Failed to fetch items" };
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

const Table = () => {
  const [lostItems, setLostItems] = useState<LostItemTable[]>([]);
  const [foundItems, setFoundItems] = useState<FoundItemTable[]>([]);
  const [selectedType, setSelectedType] = useState<"lost" | "found">("lost");

  useEffect(() => {
    if (selectedType === "lost") {
      fetchItems("0").then((response) => {
        if (response.success && response.status === 200) {
          setLostItems(response.data);
        } else {
          setLostItems([]);
        }
      });
    } else {
      fetchItems("1").then((response) => {
        if (response.success && response.status === 200) {
          console.log("Found items fetched: ", response.data);
          setFoundItems(response.data);
        } else {
          setFoundItems([]);
        }
      });
    }
  }, [selectedType]);

  return (
    <>
      {/* Radio button group */}
      <div className="mb-4 flex items-center gap-6">
        <label className="inline-flex items-center">
          <input
            type="radio"
            className="form-radio text-blue-600"
            name="itemType"
            value="lost"
            checked={selectedType === "lost"}
            onChange={() => setSelectedType("lost")}
          />
          <span className="ml-2">Lost items</span>
        </label>
        <label className="inline-flex items-center">
          <input
            type="radio"
            className="form-radio text-blue-600"
            name="itemType"
            value="found"
            checked={selectedType === "found"}
            onChange={() => setSelectedType("found")}
          />
          <span className="ml-2">Found items</span>
        </label>
        <label className="inline-flex items-center">
          <input
            type="radio"
            className="form-radio text-blue-600"
            name="itemType"
            value="match"
            // checked={selectedType === "match"}
            // onChange={() => setSelectedType("match")}
          />
          <span className="ml-2">Match results</span>
        </label>
      </div>
      <div className="relative overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-500 rtl:text-right dark:text-gray-400">
          <thead className="bg-gray-50 text-xs text-gray-700 uppercase dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Category
              </th>
              <th scope="col" className="px-6 py-3">
                Location
              </th>
              <th scope="col" className="px-6 py-3">
                Date
              </th>
              <th scope="col" className="px-6 py-3">
                Time
              </th>
              <th scope="col" className="px-6 py-3">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {selectedType === "lost" ? (
              lostItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No lost items found.
                  </td>
                </tr>
              ) : (
                lostItems.map((item, index) => (
                  <tr
                    key={item.lostId ?? index}
                    className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/lostItems/lostItems-details?id=${item.lostId}`}
                        className="text-blue-600 hover:underline"
                      >
                        {item.category}
                      </Link>
                    </td>
                    <td className="px-6 py-4">{item.description.location}</td>
                    <td className="px-6 py-4">
                      {convertDate(item.description.date)}
                    </td>
                    <td className="px-6 py-4">
                      {convertTime(item.description.time)}
                    </td>
                    <td className="flex items-center gap-2 px-6 py-4">
                      {item.status === 0 ? (
                        <>
                          <i className="fa fa-clock-o text-yellow-500"></i>
                          <span className="font-medium text-yellow-600">
                            Pending
                          </span>
                        </>
                      ) : (
                        <>
                          <i className="fa fa-check-circle text-green-500"></i>
                          <span className="font-medium text-green-600">
                            Done
                          </span>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )
            ) : foundItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No found items found.
                </td>
              </tr>
            ) : (
              foundItems.map((item, index) => (
                <tr
                  key={item.foundId ?? index}
                  className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/foundItems/claimItemForm?foundId=${encodeURIComponent(
                        item.foundId,
                      )}&location=${encodeURIComponent(
                        item.location,
                      )}&date=${encodeURIComponent(
                        convertDate(item.date),
                      )}&time=${encodeURIComponent(
                        convertTime(item.time),
                      )}&category=${encodeURIComponent(
                        item.category,
                      )}&userId=${encodeURIComponent(item.userId)}`}
                      className="text-blue-600 hover:underline"
                    >
                      {item.category}
                    </Link>
                  </td>
                  <td className="px-6 py-4">{item.location}</td>
                  <td className="px-6 py-4">{convertDate(item.date)}</td>
                  <td className="px-6 py-4">{convertTime(item.time)}</td>
                  <td className="flex items-center gap-2 px-6 py-4">
                    {item.status === 0 ? (
                      <>
                        <i className="fa fa-clock-o text-yellow-500"></i>
                        <span className="font-medium text-yellow-600">
                          Pending
                        </span>
                      </>
                    ) : (
                      <>
                        <i className="fa fa-check-circle text-green-500"></i>
                        <span className="font-medium text-green-600">Done</span>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Table;
