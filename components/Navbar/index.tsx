"use client";
import axios from "axios";

const handleLogout = () => {
  const response = axios.post("/api/logout");
  response.then(() => {
    sessionStorage.clear();
    window.location.href = "/"; // or redirect to sign-in page
  });
};

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between bg-white px-6 py-4 shadow-md">
      <h2 className="text-lg font-semibold text-gray-800">Welcome, Admin</h2>
      <button
        onClick={handleLogout}
        className="cursor-pointer rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
      >
        Logout
      </button>
    </header>
  );
}
