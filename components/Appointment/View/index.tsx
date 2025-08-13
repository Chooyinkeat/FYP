"use client";
import axios from "axios";
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import { Appointment } from "@/types/appointment";
import { useSearchParams } from "next/navigation";
import ItemLocation from "@/components/LostList/ItemLocation";
import Card from "@/components/Card";
import Swal from "sweetalert2";

function convertDateFormat(dateString: string): string {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString("en-US", options);
}

const updateStatus = async (appointmentId: string, type: string) => {
  try {
    const response = await axios.post(
      `/api/protected/updateAppointmentStatusAPI`,
      { appointmentId: appointmentId, type: type },
      { withCredentials: true },
    );
    return response.data;
  } catch (error) {
    console.log("Error updating appointment status:", error);
  }
};

const AppointmentView = () => {
  const searchParams = useSearchParams();
  const appointmentData = searchParams.get("data");

  useEffect(() => {
    if (appointmentData) {
      const parsedData = JSON.parse(
        decodeURIComponent(appointmentData),
      ) as Appointment[];
      setAppointments(parsedData);
    }
  }, [appointmentData]);

  const [appointments, setAppointments] = useState<Appointment[]>([]);

  return (
    <>
      <section className="bg-gradient-to-b from-gray-50 via-white to-white pt-24 pb-16 md:pt-28 md:pb-20 lg:pt-32 lg:pb-24 dark:from-gray-900 dark:via-gray-950 dark:to-black">
        <div className="container mx-auto">
          <div className="-mx-4 flex flex-wrap justify-center lg:gap-8">
            {/* Appointment Details */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="w-full px-4 lg:w-3/5"
            >
              <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-900">
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mb-6 border-b border-gray-200 pb-4 dark:border-gray-700"
                >
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Appointment Details
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400">
                    Review the details of your upcoming appointment below.
                  </p>
                </motion.div>

                {/* Additional Notes */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="mt-8 mb-5"
                >
                  <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                    Additional Notes
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300">
                    Please arrive 10 minutes early to complete any necessary
                    paperwork. Bring your ID and any required documents.
                  </p>
                </motion.div>

                {/* Appointment Info Grid */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {/* Date */}
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Date
                    </p>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {convertDateFormat(appointments[0]?.date)}
                    </p>
                  </div>

                  {/* Time */}
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Time
                    </p>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {appointments[0]?.time}
                    </p>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Status
                    </p>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                        appointments[0]?.status === 0
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          : appointments[0]?.status === 1
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : appointments[0]?.status === 2
                          ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {appointments[0]?.status === 0
                        ? "Pending"
                        : appointments[0]?.status === 1
                        ? "Confirmed"
                        : appointments[0]?.status === 2
                        ? "Cancelled"
                        : "Unknown"}
                    </span>
                  </div>

                  {/* Contact */}
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Contact
                    </p>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {appointments[0]?.contact}
                    </p>
                  </div>

                  {/* Email */}
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Email
                    </p>
                    <p className="text-lg font-medium break-all text-gray-900 dark:text-white">
                      {appointments[0]?.email}
                    </p>
                  </div>

                  {/* Location */}
                  <div className="sm:col-span-2 lg:col-span-3">
                    <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
                      Location
                    </p>
                    <p className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
                      {appointments[0]?.location}
                    </p>
                    {appointments[0]?.location && (
                      <ItemLocation location={appointments[0].location} />
                    )}
                  </div>
                </motion.div>

                {/* Action Buttons */}
                {appointments[0]?.status === 0 &&
                  (appointments[0]?.user_id !==
                  Number(sessionStorage.getItem("userId")) ? (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                      className="mt-8 flex flex-wrap gap-4"
                    >
                      <button
                        className="cursor-pointer rounded-full bg-green-600 px-6 py-2 text-white shadow transition-transform hover:scale-105 hover:bg-green-700 focus:ring-2 focus:ring-green-300 focus:outline-none dark:focus:ring-green-800"
                        onClick={() =>
                          updateStatus(
                            appointments[0]?.appointment_id.toString(),
                            "accept",
                          ).then(() => {
                            Swal.fire({
                              icon: "success",
                              title: "Appointment Accepted",
                              text: "The appointment has been accepted.",
                            });
                          })
                        }
                      >
                        Accept
                      </button>
                      <button
                        className="cursor-pointer rounded-full bg-red-600 px-6 py-2 text-white shadow transition-transform hover:scale-105 hover:bg-red-700 focus:ring-2 focus:ring-red-300 focus:outline-none dark:focus:ring-red-800"
                        onClick={() =>
                          updateStatus(
                            appointments[0]?.appointment_id.toString(),
                            "reject",
                          ).then(() => {
                            Swal.fire({
                              icon: "success",
                              title: "Appointment Rejected",
                              text: "The appointment has been rejected.",
                            });
                          })
                        }
                      >
                        Cancel
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                      className="mt-8 flex flex-wrap gap-4"
                    >
                      <button
                        className="cursor-pointer rounded-full bg-red-600 px-6 py-2 text-white shadow transition-transform hover:scale-105 hover:bg-red-700 focus:ring-2 focus:ring-red-300 focus:outline-none dark:focus:ring-red-800"
                        onClick={() =>
                          updateStatus(
                            appointments[0]?.appointment_id.toString(),
                            "reject",
                          ).then(() => {
                            Swal.fire({
                              icon: "success",
                              title: "Appointment Rejected",
                              text: "The appointment has been rejected.",
                            });
                          })
                        }
                      >
                        Cancel
                      </button>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
            {/* Appointment Card */}
            {appointments.length > 0 && appointments[0]?.case_id && (
              <Card foundId={appointments[0].case_id} className="lg:w-1/4" />
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default AppointmentView;
