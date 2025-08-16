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
  const d = new Date(date);
  const readableDate = d.toLocaleDateString("en-MY", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return readableDate;
};

const convertTime = (time: string) => {
  const today = new Date();
  const [hours, minutes, seconds] = time.split(":");
  today.setHours(Number(hours), Number(minutes), Number(seconds || 0));
  return today.toLocaleTimeString("en-MY", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
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
        console.log("Fake Claims Response: ", response.data);
        if (response.status === 200) {
          const parsed = response.data.map((claim) => {
            const parsedImagePayload = JSON.parse(claim.image_payload);
            const imagePayload = {
              userUploadImage: parsedImagePayload.userUploadImage,
              image_url_payload: JSON.parse(
                parsedImagePayload.originalImages?.[0]?.image_url_payload ??
                  "[]",
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 dark:from-gray-900 dark:to-gray-800 sm:p-6 lg:p-8">
      {/* Enhanced Header Section */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl lg:text-5xl">
          My Items Dashboard
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Manage your lost items, found items, and monitor false claims
        </p>
      </div>

      {/* Enhanced Tab Navigation */}
      <div className="mb-8 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-center sm:space-y-0 sm:space-x-4">
        {[
          { value: "lost", label: "Lost Items", icon: "🔍" },
          { value: "found", label: "Found Items", icon: "📦" },
          { value: "fakeclaim", label: "False Claims", icon: "⚠️" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSelectedType(tab.value as any)}
            className={`group relative flex w-full items-center justify-center space-x-2 rounded-xl px-6 py-4 text-sm font-medium transition-all duration-300 sm:w-auto ${
              selectedType === tab.value
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25 ring-2 ring-blue-600 ring-offset-2 dark:ring-offset-gray-900"
                : "bg-white text-gray-700 hover:bg-gray-50 hover:text-blue-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-blue-400"
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      {/* Enhanced Table Container */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-gray-800 dark:shadow-2xl">
        {selectedType === "lost" || selectedType === "found" ? (
          <div className="relative overflow-x-auto">
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
          </div>
        ) : null}

        {/* Enhanced Fake Claims Section */}
        {selectedType === "fakeclaim" && (
          <div className="p-6">
            {fakeClaims.length > 0 ? (
              <div className="space-y-6">
                <div className="rounded-xl bg-gradient-to-r from-red-500 to-red-600 p-6 text-center text-white shadow-lg">
                  <div className="mb-2 text-3xl">🚨</div>
                  <h3 className="text-xl font-bold">Fake Claims Detected</h3>
                  <p className="text-red-100">
                    {fakeClaims.length} potential false claim{fakeClaims.length !== 1 ? 's' : ''} found
                  </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-1">
                  {fakeClaims.map((claim, index) => (
                    <div
                      key={claim.itemId ?? index}
                      className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg transition-all duration-300 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800"
                    >
                      <div className="p-6">
                        {/* Top Info Section */}
                        <div className="mb-6 grid gap-6 lg:grid-cols-2">
                          <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                              Suspect Profile
                            </h4>
                              <UserProfile userId={claim.suspectId.toString()} />
                          </div>
                          <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                              Claimed Item
                            </h4>
                              <Card foundId={claim.itemId} className="" />
                          </div>
                        </div>

                        {/* Status Section */}
                        <div className="mb-6">
                          <h4 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                            Case Status
                          </h4>
                          {claim.status === 0 ? (
                            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
                              <div className="flex items-center space-x-2 rounded-lg bg-yellow-50 px-4 py-3 dark:bg-yellow-900/20">
                                <i className="fa fa-exclamation-triangle text-yellow-600 dark:text-yellow-400"></i>
                                <span className="font-medium text-yellow-800 dark:text-yellow-200">
                                  Action Required
                                </span>
                              </div>
                              <Link
                                href={`/reports?suspectId=${encodeURIComponent(
                                  claim.suspectId,
                                )}&fakeClaimId=${encodeURIComponent(
                                  claim.fakeClaimId,
                                )}`}
                                className="inline-flex items-center rounded-lg bg-red-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none dark:bg-red-600 dark:hover:bg-red-700"
                              >
                                <i className="fa fa-flag mr-2"></i>
                                Report This User
                              </Link>
                            </div>
                          ) : claim.status === 1 ? (
                            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-700 dark:bg-yellow-900/20">
                              <div className="flex items-center space-x-2">
                                <i className="fa fa-clock text-yellow-600 dark:text-yellow-400"></i>
                                <span className="font-semibold text-yellow-800 dark:text-yellow-200">
                                  Pending Review
                                </span>
                              </div>
                              <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                                Admin is currently handling this issue. Please wait for updates.
                              </p>
                            </div>
                          ) : (
                            <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-700 dark:bg-green-900/20">
                              <div className="flex items-center space-x-2">
                                <i className="fa fa-check-circle text-green-600 dark:text-green-400"></i>
                                <span className="font-semibold text-green-800 dark:text-green-200">
                                  Case Resolved
                                </span>
                              </div>
                              <p className="mt-2 text-sm text-green-700 dark:text-green-300">
                                The suspected user has been banned. You can now close this case.
                              </p>
                              <button
                                className="mt-3 inline-flex items-center rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:outline-none dark:bg-red-600 dark:hover:bg-red-700"
                                onClick={() =>
                                  closedFakeClaim(claim.fakeClaimId).then(
                                    (response) => {
                                      if (response.status === 200) {
                                        location.reload();
                                      }
                                    },
                                  )
                                }
                              >
                                <i className="fa fa-times mr-2"></i>
                                Close Case
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Images Section */}
                        <div className="space-y-6">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Image Evidence
                          </h4>
                          <div className="grid gap-6 lg:grid-cols-2">
                            {/* User Uploaded Images */}
                            <div className="space-y-3">
                              <h5 className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                <i className="fa fa-user text-blue-500"></i>
                                <span>User Uploaded Images</span>
                              </h5>
                              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {claim.imagePayload.userUploadImage.map(
                                  (url, idx) => (
                                    <img
                                      key={idx}
                                      src={url}
                                      alt={`User Upload ${idx + 1}`}
                                      className="h-20 w-full rounded-lg border border-gray-300 object-cover shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md dark:border-gray-600 sm:h-24"
                                    />
                                  ),
                                )}
                              </div>
                            </div>

                            {/* Original Images */}
                            <div className="space-y-3">
                              <h5 className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                <i className="fa fa-image text-green-500"></i>
                                <span>Original Item Images</span>
                              </h5>
                              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {claim.imagePayload.image_url_payload.map(
                                  (url, idx) => (
                                    <img
                                      key={idx}
                                      src={url}
                                      alt={`Original Image ${idx + 1}`}
                                      className="h-20 w-full rounded-lg border border-gray-300 object-cover shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md dark:border-gray-600 sm:h-24"
                                    />
                                  ),
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-gradient-to-r from-green-500 to-green-600 p-12 text-center text-white shadow-lg">
                <div className="mb-4 text-6xl">🎉</div>
                <h3 className="mb-2 text-2xl font-bold">All Clear!</h3>
                <p className="text-lg text-green-100">
                  No fake claim cases detected at the moment.
                </p>
                <p className="text-sm text-green-200">
                  Your community is safe and secure.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Table;
