"use client";

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import "../globals.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // <html lang="en">
    //   <body className="flex h-screen bg-gray-100">
    //     {/* Sidebar */}
    //     <Sidebar />

    //     {/* Main content area */}
    //     <div className="flex flex-1 flex-col">
    //       <Navbar />
    //       <main className="overflow-y-auto p-4">{children}</main>
    //     </div>
    //   </body>
    // </html>
    <html lang="en">
      <body className="flex h-screen bg-gray-50 font-sans">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
