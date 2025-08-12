"use client";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { TotalRows } from "@/types/admin";
import { motion } from "framer-motion";
import { FileText, Bot, BarChart3, Eye } from "lucide-react";

const getData = async () => {
  try {
    const response = await axios.get("/api/protected/getReportCountAPI", {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

const Dashboard = () => {
  const [data, setData] = useState<TotalRows[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getData().then((response) => {
      if (response && response.status === 200) {
        setData(response.data);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your reports and AI prompts
          </p>
        </motion.div>

        {/* Main Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          {/* Total Reports Card */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Reports
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {data?.[0]?.total_rows || 0}
                </p>
              </div>
              <div className="rounded-lg bg-blue-100 p-3">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <a
                href="/admin/reports"
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View all reports
                <Eye className="ml-1 h-4 w-4" />
              </a>
            </div>
          </div>

          {/* GEMINI Prompts Card */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  GEMINI Prompts
                </p>
                <p className="text-3xl font-bold text-gray-900">Active</p>
              </div>
              <div className="rounded-lg bg-green-100 p-3">
                <Bot className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <a
                href="/admin/gemini"
                className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700"
              >
                Manage prompts
                <BarChart3 className="ml-1 h-4 w-4" />
              </a>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <a
              href="/dashboard/reports"
              className="group flex items-center rounded-lg border border-gray-200 p-4 transition-colors hover:border-blue-300 hover:bg-blue-50"
            >
              <div className="rounded-lg bg-blue-100 p-3 transition-colors group-hover:bg-blue-200">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  View Reports
                </h3>
                <p className="text-sm text-gray-500">
                  Review and manage user reports
                </p>
              </div>
            </a>

            <a
              href="/dashboard"
              className="group flex items-center rounded-lg border border-gray-200 p-4 transition-colors hover:border-green-300 hover:bg-green-50"
            >
              <div className="rounded-lg bg-green-100 p-3 transition-colors group-hover:bg-green-200">
                <Bot className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Manage GEMINI
                </h3>
                <p className="text-sm text-gray-500">
                  Configure AI prompts and settings
                </p>
              </div>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
