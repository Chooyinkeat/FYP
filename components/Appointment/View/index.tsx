"use client";
import axios from "axios";
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";

const AppointmentView = () => {
  const [appointments, setAppointments] = useState([]);

  return (
    <>
      <section className="bg-gradient-to-b from-gray-50 via-white to-white pt-24 pb-16 md:pt-28 md:pb-20 lg:pt-32 lg:pb-24 dark:from-gray-900 dark:via-gray-950 dark:to-black">
        <div className="container mx-auto">
          <div className="-mx-4 flex flex-wrap lg:gap-8">
            {/* Appointment Details */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="w-full px-4 lg:w-3/4"
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

                {/* Appointment Info Grid */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                >
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Date
                    </p>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      15 Aug 2025
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Time
                    </p>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      10:30 AM
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Status
                    </p>
                    <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
                      Confirmed
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Location
                    </p>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      123 Main Street, Kuala Lumpur, Malaysia
                    </p>
                  </div>
                </motion.div>

                {/* Additional Notes */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="mt-8"
                >
                  <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                    Additional Notes
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300">
                    Please arrive 10 minutes early to complete any necessary
                    paperwork. Bring your ID and any required documents.
                  </p>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="mt-8 flex flex-wrap gap-4"
                >
                  <button className="rounded-full bg-blue-600 px-6 py-2 text-white shadow transition-transform hover:scale-105 hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 focus:outline-none dark:focus:ring-blue-800">
                    Reschedule
                  </button>
                  <button className="rounded-full bg-red-600 px-6 py-2 text-white shadow transition-transform hover:scale-105 hover:bg-red-700 focus:ring-2 focus:ring-red-300 focus:outline-none dark:focus:ring-red-800">
                    Cancel Appointment
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AppointmentView;
