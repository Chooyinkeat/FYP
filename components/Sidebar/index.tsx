"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  FileText,
  Bot,
  Shield,
  Settings,
  User,
} from "lucide-react";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      description: "Overview and analytics",
    },
    {
      label: "Reports",
      href: "/dashboard/reports",
      icon: FileText,
      description: "Manage user reports",
    },
    {
      label: "User account",
      href: "/dashboard/user-account",
      icon: Bot,
      description: "Manage user accounts",
    },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile Toggle */}
      <div className="flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 shadow-lg md:hidden">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg bg-white/20 p-2 text-white transition-all hover:bg-white/30 focus:ring-2 focus:ring-white/50 focus:outline-none"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-72 transform bg-gradient-to-b from-indigo-900 via-indigo-800 to-purple-900 shadow-2xl transition-all duration-300 ease-in-out md:static md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b border-white/10 p-6">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-purple-400 shadow-lg">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                <p className="text-sm text-indigo-200">Control Center</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 p-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center space-x-3 rounded-xl px-4 py-3 transition-all duration-200 hover:bg-white/10 ${
                    active
                      ? "border border-white/20 bg-gradient-to-r from-indigo-500/20 to-purple-500/20"
                      : "hover:border-white/10"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200 ${
                      active
                        ? "bg-gradient-to-br from-indigo-400 to-purple-400 shadow-lg"
                        : "bg-white/10 group-hover:bg-white/20"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 transition-colors ${
                        active
                          ? "text-white"
                          : "text-indigo-200 group-hover:text-white"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <p
                      className={`font-medium transition-colors ${
                        active
                          ? "text-white"
                          : "text-indigo-100 group-hover:text-white"
                      }`}
                    >
                      {item.label}
                    </p>
                    <p
                      className={`text-xs transition-colors ${
                        active
                          ? "text-indigo-200"
                          : "text-indigo-300 group-hover:text-indigo-200"
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>
                  {active && (
                    <div className="absolute right-3 h-2 w-2 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-white/10 p-4">
            <div className="rounded-lg bg-white/5 p-3">
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-400 to-purple-400">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Admin User</p>
                  <p className="text-xs text-indigo-200">Super Admin</p>
                </div>
                <button className="rounded-lg p-1 text-indigo-200 transition-colors hover:bg-white/10 hover:text-white">
                  <Settings className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
