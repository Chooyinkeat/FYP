"use client";
import React, { useEffect, useState } from "react";
import { LostItem } from "@/types/items";
import axios from "axios";
import { User } from "@/types/user";
import Image from "next/image";

const LostDetails = () => {
  const [item, setItem] = useState<LostItem | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [parsedDescription, setParsedDescription] = useState<{
    category: string;
    location: string;
    description: string;
  } | null>(null);

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

  useEffect(() => {
    const stored = localStorage.getItem("selectedLostItem");
    if (stored) {
      try {
        const parsed: LostItem = JSON.parse(stored);
        setItem(parsed);

        // Fetch user data if needed
        fetchUserData(parsed.userId).then((data) => {
          if (data.status === 200) {
            setUser(data.user);
          }
        });
        const desc = JSON.parse(parsed.description);
        setParsedDescription(desc);
      } catch (err) {
        console.error("Failed to load or parse lost item:", err);
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      localStorage.removeItem("selectedLostItem");
    };
  }, []);

  if (!item || !parsedDescription) {
    return (
      <div className="text-center text-gray-500">Loading item details...</div>
    );
  }

  return (
    <>
      {item && parsedDescription ? (
        <>
          <div className="md:w-1/2 lg:w-[32%]">
            <div className="animate_top border-stroke shadow-solid-13 dark:border-strokedark dark:bg-blacksection mb-10 rounded-md border bg-white p-9">
              {user && (
                <ul className="space-y-2">
                  <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="mt-5 flex flex-col items-center pb-10">
                      <img
                        className="mb-3 h-24 w-24 rounded-full object-cover shadow-lg"
                        src={user.profile || "/images/default_pic.png"} // fallback if profile is missing
                        alt={user.username + " profile"}
                      />
                      <h5 className="mb-1 text-xl font-medium text-gray-900 dark:text-white">
                        Name: {user.username}
                      </h5>
                      <span className="my-3 text-sm text-gray-500 dark:text-gray-400">
                        Email: {user.email}
                      </span>
                      <span className="my-3 text-sm text-gray-500 dark:text-gray-400">
                        Phone: {user.contact}
                      </span>
                    </div>
                  </div>
                </ul>
              )}
            </div>
          </div>
          ``
          <div className="lg:w-2/3">
            <div className="animate_top border-stroke shadow-solid-13 dark:border-strokedark dark:bg-blacksection rounded-md border bg-white p-7.5 md:p-10">
              <div className="mb-10 w-full overflow-hidden">
                <div className="relative aspect-97/60 w-full sm:aspect-97/44">
                  <Image
                    src={item.imageUrl[0] || "/images/blog/img_1.webp"}
                    alt={parsedDescription.category}
                    fill
                    className="rounded-md object-cover object-center"
                  />
                </div>
              </div>

              <h2 className="2xl:text-sectiontitle2 mt-11 mb-5 text-3xl font-semibold text-black dark:text-white">
                Category: {parsedDescription.category}
              </h2>

              <ul className="mb-9 flex flex-wrap gap-5 2xl:gap-7.5">
                <li>
                  <span className="text-black dark:text-white">Location: </span>{" "}
                  Location: {parsedDescription.location}
                </li>
              </ul>

              <div className="blog-details">
                <p>Description: {parsedDescription.description}</p>
                {item.imageUrl.length > 1 && (
                  <div className="flex flex-wrap gap-5 pt-6">
                    {item.imageUrl.map((img, idx) => (
                      <Image
                        key={idx}
                        src={img}
                        width={350}
                        height={200}
                        alt={`image-${idx}`}
                        className="rounded-md"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500">Loading item details...</div>
      )}
    </>
  );
};
export default LostDetails;
