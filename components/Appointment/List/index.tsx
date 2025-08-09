"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { Appointment } from "@/types/appointment";

// Status color mapping
const statusColors: Record<number, string> = {
  0: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", // Pending
  1: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", // Confirmed
  2: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", // Cancelled
};

const fetchAppointments = async () => {
  try {
    const response = await axios.get("/api/protected/getAppointmentAPI", {
      withCredentials: true,
    });
    return response.data.data as Appointment[];
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return [];
  }
};

function formatTimeTo12Hour(time24: string) {
  const [hourStr, minuteStr] = time24.split(":");
  let hour = parseInt(hourStr, 10);
  const minutes = minuteStr.padStart(2, "0");
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minutes} ${ampm}`;
}

export default function AppointmentsList() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    fetchAppointments().then((data) => {
      console.log("Fetched appointments: ", data);
      setAppointments(data);
    });
  }, []);

  return (
    <section className="bg-gradient-to-b from-gray-50 via-white to-white pt-24 pb-16 md:pt-28 md:pb-20 lg:pt-32 lg:pb-24 dark:from-gray-900 dark:via-gray-950 dark:to-black">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Appointments
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            View and manage all your upcoming and past appointments.
          </p>
        </motion.div>

        {appointments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <Image
              src="/images/no-appointment.webp"
              alt="No Appointments"
              width={200}
              height={200}
              className="mb-6"
            />
            <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              No Appointments Found
            </h2>
            <p className="mb-6 max-w-md text-gray-600 dark:text-gray-400">
              It looks like you have no upcoming appointments. When you book
              one, it will appear here.
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {appointments.map((appt, index) => (
              <motion.div
                key={appt.appointment_id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-md transition hover:shadow-lg dark:border-gray-700 dark:bg-gray-900"
              >
                {/* Status + Date */}
                <div className="mb-4 flex items-center justify-between">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                      statusColors[appt.status] ||
                      "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                    }`}
                  >
                    {appt.status === 0
                      ? "Pending"
                      : appt.status === 1
                      ? "Confirmed"
                      : appt.status === 2
                      ? "Cancelled"
                      : "Unknown"}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {appt.date}
                  </span>
                </div>

                {/* Time */}
                <p className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  {formatTimeTo12Hour(appt.time)}
                </p>

                {/* Location */}
                <p className="mb-4 text-gray-600 dark:text-gray-300">
                  {appt.location}
                </p>

                {/* Contact & Email */}
                <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                  <p>📞 {appt.contact}</p>
                  <p>✉️ {appt.email}</p>
                </div>

                {/* Link */}
                <Link href={`/appointments/${appt.appointment_id}`}>
                  <button className="w-full rounded-full bg-blue-600 px-4 py-2 text-white shadow transition-transform hover:scale-105 hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 focus:outline-none dark:focus:ring-blue-800">
                    View Details
                  </button>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
