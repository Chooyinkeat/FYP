"use client";
import axios from "axios";
import Link from "next/link";
import { useState, useEffect } from "react";
import { FakeClaimItem } from "@/types/fakeClaim";
import { FoundItemTable, LostItemTable } from "@/types/items";
import Card from "@/components/Card";
import UserProfile from "@/components/LostList/UserProfile";
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

const fetchFakeClaims = async () => {
  try {
    const response = await axios.get(
      "/api/protected/fakeClaimAPI/getFakeClaimAPI",
      {
        withCredentials: true,
      },
    );
    return response.data;
  } catch (error) {
    console.log("Error fetching fake claims:", error);
    return { success: false, message: "Failed to fetch fake claims" };
  }
};

const closedFakeClaim = async (Id: number) => {
  try {
    const response = await axios.post(
      "/api/protected/fakeClaimAPI/updateStatusAPI",
      { id: Id },
      {
        withCredentials: true,
      },
    );
    return response.data;
  } catch (error) {
    console.log("Error fetching fake claims:", error);
    return { success: false, message: "Failed to fetch fake claims" };
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
  const [fakeClaims, setFakeClaims] = useState<FakeClaimItem[]>([]);
  const [selectedType, setSelectedType] = useState<
    "lost" | "found" | "fakeclaim"
  >("lost");

  useEffect(() => {
    if (selectedType === "lost") {
      fetchItems("0").then((response) => {
        if (response.success && response.status === 200) {
          setLostItems(response.data);
        } else {
          setLostItems([]);
        }
      });
    } else if (selectedType === "fakeclaim") {
      fetchFakeClaims().then((response) => {
        if (response.status === 200) {
          const parsed = response.data.map((claim) => {
            const parsedImagePayload = JSON.parse(claim.image_payload);
            const imagePayload = {
              userUploadImage: parsedImagePayload.userUploadImage,
              image_url_payload: JSON.parse(
                parsedImagePayload.image_url_payload,
              ),
            };

            return {
              ...claim,
              itemId: claim.item_id,
              suspectId: claim.suspect_id,
              fakeClaimId: claim.fake_claim_id,
              imagePayload,
            };
          });
          setFakeClaims(parsed);
        } else {
          setFakeClaims([]);
        }
      });
    } else {
      fetchItems("1").then((response) => {
        if (response.success && response.status === 200) {
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
      <div className="mb-4 flex items-center justify-between gap-8">
        <label className="inline-flex cursor-pointer items-center">
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
        <label className="inline-flex cursor-pointer items-center">
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
        <label className="inline-flex cursor-pointer items-center">
          <input
            type="radio"
            className="form-radio text-blue-600"
            name="itemType"
            value="fakeclaim"
            checked={selectedType === "fakeclaim"}
            onChange={() => setSelectedType("fakeclaim")}
          />
          <span className="ml-2">False Claim Detection</span>
        </label>
      </div>
      <div className="relative overflow-x-auto">
        {selectedType === "lost" || selectedType === "found" ? (
          <table className="w-full text-left text-sm text-gray-500 rtl:text-right dark:text-gray-400">
            <thead className="bg-gray-50 text-xs text-gray-700 uppercase dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Time</th>
                <th className="px-6 py-3">Status</th>
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
                      className="border-b bg-white dark:border-gray-700 dark:bg-gray-800"
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
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No found items found.
                  </td>
                </tr>
              ) : (
                foundItems.map((item, index) => (
                  <tr
                    key={item.foundId ?? index}
                    className="border-b bg-white dark:border-gray-700 dark:bg-gray-800"
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
                          <span className="font-medium text-green-600">
                            Done
                          </span>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : null}
        {/* 🆕 FAKE CLAIMS SECTION */}
        {selectedType === "fakeclaim" &&
          (fakeClaims.length > 0 ? (
            <table className="w-full text-left text-sm text-gray-500 rtl:text-right dark:text-gray-400">
              <tbody>
                <tr>
                  <td
                    colSpan={5}
                    className="bg-red-50 px-6 py-4 text-center font-semibold text-red-600 dark:bg-red-900"
                  >
                    Fake Claims Detected
                  </td>
                </tr>
                {fakeClaims.map((claim, index) => (
                  <tr
                    key={claim.itemId ?? index}
                    className="border-b bg-white transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                  >
                    <td colSpan={5} className="px-6 py-5">
                      {/* Top Info Section */}
                      <div className="mb-4 flex flex-col gap-2 text-sm text-gray-800 dark:text-gray-200">
                        <div className="flex">
                          <div className="w-1/2">
                            <UserProfile userId={claim.suspectId.toString()} />
                          </div>
                          <div className="w-1/2">
                            <Card foundId={claim.itemId} className="" />
                          </div>
                        </div>
                        {/* Status Section */}
                        <div className="mt-1">
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            Status:
                          </span>{" "}
                          {claim.status === 0 ? (
                            <Link
                              href={`/reports?suspectId=${encodeURIComponent(
                                claim.suspectId,
                              )}&fakeClaimId=${encodeURIComponent(
                                claim.fakeClaimId,
                              )}`}
                              className="ml-3 inline-flex items-center rounded bg-red-600 px-3 py-1 text-xs font-medium text-white shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none"
                            >
                              Report this user
                            </Link>
                          ) : claim.status === 1 ? (
                            <div className="mt-1 rounded border border-yellow-200 bg-yellow-50 px-3 py-2">
                              <span className="block font-semibold text-yellow-700">
                                Pending
                              </span>
                              <p className="text-xs text-yellow-800">
                                Admin is handling this issue.
                              </p>
                            </div>
                          ) : (
                            <div className="mt-1 rounded border border-green-200 bg-green-50 px-3 py-2">
                              <span className="block font-semibold text-green-700">
                                Solved
                              </span>
                              <p className="text-xs text-green-800">
                                The suspected user has been banned.
                              </p>
                              <button
                                className="mt-1 inline-flex cursor-pointer items-center rounded bg-red-500 px-3 py-1 text-xs font-medium text-white shadow-sm"
                                onClick={() =>
                                  closedFakeClaim(claim.fakeClaimId).then(
                                    (response) => {
                                      if (response.status === 200) {
                                        // Refresh the page or update the UI
                                        location.reload();
                                      }
                                    },
                                  )
                                }
                              >
                                Closed
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Images Section */}
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* User Uploaded */}
                        <div>
                          <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            User Uploaded Images:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {claim.imagePayload.userUploadImage.map(
                              (url, idx) => (
                                <img
                                  key={idx}
                                  src={url}
                                  alt={`User Upload ${idx}`}
                                  className="h-24 w-24 rounded-lg border border-gray-300 object-cover shadow-sm transition-transform hover:scale-105 hover:shadow-md"
                                />
                              ),
                            )}
                          </div>
                        </div>

                        {/* Original Images */}
                        <div>
                          <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Original Images:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {claim.imagePayload.image_url_payload.map(
                              (url, idx) => (
                                <img
                                  key={idx}
                                  src={url}
                                  alt={`Original Image ${idx}`}
                                  className="h-24 w-24 rounded-lg border border-gray-300 object-cover shadow-sm transition-transform hover:scale-105 hover:shadow-md"
                                />
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="mt-4 rounded border border-gray-200 bg-gray-50 px-6 py-4 text-center text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              🎉 No fake claim cases at the moment!
            </div>
          ))}
      </div>
    </>
  );
};

export default Table;
