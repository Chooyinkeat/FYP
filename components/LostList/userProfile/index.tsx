"use client";
import axios from "axios";
import { User } from "@/types/user";
import { useEffect, useState } from "react";

const fetchUserData = async (userId: string) => {
  try {
    const response = await axios.post(
      "/api/protected/fetchUserAPI",
      { userId },
      { withCredentials: true },
    );
    return response.data;
  } catch (error) {
    console.log("Error fetching user data:", error);
    return null;
  }
};

const notifyOwner = async (email: string) => {
  try {
    const response = await axios.post(
      "/api/protected/fetchUserAPI",
      { email: email },
      { withCredentials: true },
    );
    return response.data;
  } catch (error) {
    console.error("Error notifying owner:", error);
  }
};

const UserProfile = ({ userId }: { userId: string }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUserData(userId).then((data) => {
      if (data.status === 200) {
        setUser(data.user);
      } else {
        console.log("Failed to fetch user data: ", data.message);
      }
    });
  }, []);

  return (
    <>
      <div className="md:w-1/2 lg:w-[32%]">
        <div className="animate_top border-stroke shadow-solid-13 dark:border-strokedark dark:bg-blacksection mb-10 rounded-md border bg-white p-9">
          {user && (
            <div className="flex justify-center">
              <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-gradient-to-br from-white via-blue-50 to-blue-100 p-6 shadow-xl dark:border-gray-700 dark:bg-gradient-to-br dark:from-gray-800 dark:via-gray-900 dark:to-gray-800">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <img
                      className="h-28 w-28 rounded-full border-4 border-blue-500 object-cover shadow-lg"
                      src={user.profile || "/images/default_pic.png"}
                      alt={user.username + " profile"}
                    />
                  </div>
                  <h5 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
                    {user.username}
                  </h5>
                  <div className="mt-2 flex flex-col items-center gap-1">
                    <span className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                      <svg
                        className="h-4 w-4 text-blue-500"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          d="M12 14v7m0 0H7m5 0h5"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                      {user.email}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                      <svg
                        className="h-4 w-4 text-blue-500"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M2 8.5C2 6.015 4.015 4 6.5 4h11C19.985 4 22 6.015 22 8.5v7c0 2.485-2.015 4.5-4.5 4.5h-11C4.015 20 2 17.985 2 15.5v-7Z"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          d="M6 9h.01M12 15h.01M18 9h.01"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                      {user.contact}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="mt-5 inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-300 focus:ring-2 focus:ring-blue-300 focus:outline-none lg:mt-5 xl:mt-5 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-800"
                  >
                    Alert Owner
                    <svg
                      className="h-4 w-4"
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
            </div>
          )}
        </div>
      </div>
    </>
  );
};
export default UserProfile;
