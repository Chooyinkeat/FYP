"use client";
import { useState } from "react";
import axios from "axios";
import { User, LogOut, ChevronDown } from "lucide-react";

const handleLogout = () => {
  const response = axios.post("/api/logout");
  response.then(() => {
    sessionStorage.clear();
    window.location.href = "/"; // or redirect to sign-in page
  });
};

export default function Navbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/80 shadow-sm backdrop-blur-md">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent">
                  Welcome, Admin
                </h2>
                <p className="text-sm text-gray-500">
                  Manage your system efficiently
                </p>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex cursor-pointer items-center space-x-2 rounded-lg border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-2 transition-all duration-200 hover:from-indigo-100 hover:to-purple-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="hidden text-sm font-medium text-gray-700 sm:block">
                  Admin
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                    isProfileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-gray-200 bg-white py-2 shadow-lg">
                  <div className="border-b border-gray-100 px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">
                      Admin User
                    </p>
                    <p className="text-xs text-gray-500">admin@example.com</p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex w-full cursor-pointer items-center space-x-3 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
