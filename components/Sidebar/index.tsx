"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Reports", href: "/dashboard/reports" },
    { label: "AI Gemini Prompt", href: "/dashboard/ai-gemini" },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <div className="flex items-center justify-between bg-white px-4 py-3 shadow-md md:hidden">
        <h1 className="text-lg font-bold text-gray-800">Admin Panel</h1>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-600 hover:text-gray-900"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 transform bg-white shadow-xl transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col p-6">
          <h1 className="mb-8 hidden text-2xl font-bold text-indigo-600 md:block">
            Admin Panel
          </h1>
          <nav className="flex flex-col gap-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-4 py-2 text-gray-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
