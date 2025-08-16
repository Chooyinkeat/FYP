"use client";
import axios from "axios";
import React, { useState, useEffect } from "react";
import NextImage from "next/image";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import MyMap from "@/components/MapWrapper";
import { useSearchParams } from "next/navigation";
import UserProfile from "@/components/LostList/UserProfile";

const Appointment = () => {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const urls = searchParams.get("urls");
  const caseId = searchParams.get("caseId");
  const [location, setLocation] = useState<string>("");
  const [mapPosition, setMapPosition] = useState<[number, number]>([
    3.139, 101.6869,
  ]);

  const handleForwardGeocode = async () => {
    if (!location.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          location,
        )}`,
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        setMapPosition([parseFloat(lat), parseFloat(lon)]);
        setLocation(display_name); // normalize the input to display name
      } else {
        Swal.fire({
          icon: "warning",
          title: "Location not found",
          text: "Please enter a valid address or location.",
        });
        setLocation(""); // clear the input if no results
        setMapPosition([3.139, 101.6869]); // reset to default position
      }
    } catch (error) {
      console.error("Forward geocoding error:", error);
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    urls: string,
    userId: string,
    caseId: string,
  ) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("receiverId", userId);
    formData.append("caseId", caseId);
    try {
      const response = await axios.post(
        "/api/protected/appointmentAPI",
        formData,
        { withCredentials: true },
      );

      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Upload Successful",
          text: "Your appointment has been created successfully.",
        });

        formData.append("urls", urls);
        try {
          const response = await axios.post(
            "/api/protected/notifyUserAPI",
            formData,
            {
              withCredentials: true,
            },
          );
          if (response.data.success) {
            // clear form
            formData.forEach((value, key) => {
              formData.set(key, "");
            });
          }
        } catch (error) {
          console.log("Error notifying user:", error);
          Swal.fire({
            icon: "error",
            title: "Notification Failed",
            text: "Failed to notify the user about the found item.",
          });
        }

        window.location.href = "/appointment/list";
      }
    } catch (err) {
      console.log("Unexpected error: ", err);
    }
  };

  useEffect(() => {
    console.log("caseId: ", caseId);

    const fetchAddress = async () => {
      const [lat, lon] = mapPosition;
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
        );
        const data = await response.json();
        if (data && data.display_name) {
          setLocation(data.display_name);
        } else {
          setLocation("Address not found");
        }
      } catch (error) {
        console.error("Error reverse geocoding:", error);
        setLocation("Error fetching location");
      }
    };
    fetchAddress();
  }, [mapPosition]);

  return (
    <>
      <section
        id="submit"
        className="relative bg-gradient-to-b from-blue-50 via-white to-white px-4 py-16 md:px-8 dark:from-gray-800 dark:via-gray-900 dark:to-black"
      >
        <div className="max-w-c-1390 relative mx-auto px-7.5 lg:px-15 xl:px-20">
          <div className="absolute top-0 left-0 -z-1 h-2/3 w-full rounded-lg bg-gradient-to-t from-transparent to-[#dee7ff47] dark:to-[#252A42]"></div>
          <div className="absolute bottom-[-255px] left-0 -z-1 h-full w-full">
            <NextImage
              src="./images/shape/shape-dotted-light.svg"
              alt="Dotted"
              className="dark:hidden"
              fill
            />
            <NextImage
              src="./images/shape/shape-dotted-dark.svg"
              alt="Dotted"
              className="hidden dark:block"
              fill
            />
          </div>

          <div className="mt-10 flex flex-col-reverse flex-wrap gap-8 md:flex-row md:flex-nowrap md:justify-between xl:gap-20">
            {/* Form Card */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: -20 },
                visible: { opacity: 1, y: 0 },
              }}
              initial="hidden"
              whileInView="visible"
              transition={{ duration: 1, delay: 0.1 }}
              viewport={{ once: true }}
              className="animate_top w-full rounded-2xl bg-white p-8 shadow-lg md:w-3/5 lg:w-3/4 xl:p-12 dark:border dark:border-gray-700 dark:bg-gray-900"
            >
              <h2 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
                Select where to hand out the item
              </h2>

              <form
                method="POST"
                className="space-y-8"
                onSubmit={(e) =>
                  handleSubmit(e, urls || "", userId || "", caseId || "")
                }
              >
                {/* email */}
                <div className="flex flex-col gap-5 lg:flex-row lg:gap-8">
                  <input
                    type="email"
                    name="email"
                    placeholder="Your email address"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  />
                  <input
                    type="text"
                    name="contact"
                    placeholder="Your contact number"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>
                {/* Date & Time */}
                <div className="flex flex-col gap-5 lg:flex-row lg:gap-8">
                  <input
                    type="date"
                    name="date"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-400"
                    required
                  />
                  <input
                    type="time"
                    name="time"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-400"
                    required
                  />
                </div>
                {/* Location */}
                <input
                  type="text"
                  name="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onBlur={handleForwardGeocode}
                  placeholder="Enter address or location..."
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-400"
                />
                {/* Map */}
                <div className="relative z-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <MyMap
                    position={mapPosition}
                    zoom={20}
                    onLocationSelect={(lat, lng) => {
                      setMapPosition([lat, lng]);
                    }}
                    editable={true}
                  />
                </div>
                {/* Submit */}
                <div className="flex justify-start">
                  <button
                    type="submit"
                    className="inline-flex cursor-pointer items-center gap-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 focus:outline-none dark:focus:ring-blue-800"
                  >
                    Submit
                    <svg
                      className="fill-white"
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M10.4767 6.16664L6.00668 1.69664L7.18501 0.518311L13.6667 6.99998L7.18501 13.4816L6.00668 12.3033L10.4767 7.83331H0.333344V6.16664H10.4767Z" />
                    </svg>
                  </button>
                </div>
              </form>
            </motion.div>
            <UserProfile userId={userId || ""} />
          </div>
        </div>
      </section>
    </>
  );
};

export default Appointment;
