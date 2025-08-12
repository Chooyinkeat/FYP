"use client";
import React, { useState, useEffect } from "react";
import { User, AlertTriangle, Image as ImageIcon } from "lucide-react";
import UserProfile from "@/components/LostList/UserProfile";
import Card from "@/components/Card";

const Header = ({
  reporterId,
  suspectId,
  caseId,
}: {
  reporterId: string;
  suspectId: string;
  caseId: string;
}) => {
  return (
    <div className="mt-8 space-y-6 sm:grid sm:grid-cols-1 sm:gap-6 sm:space-y-0 lg:grid-cols-2 lg:gap-8">
      {/* Reporter ID Card */}
      <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <User className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold tracking-wide text-blue-900 uppercase">
              Reporter ID
            </p>
            <div className="mt-2">
              <UserProfile userId={reporterId} />
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-400"></div>
      </div>

      {/* Suspect ID Card */}
      <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-red-50 to-pink-50 p-6 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold tracking-wide text-red-900 uppercase">
              Suspect ID
            </p>
            <div className="mt-2">
              <UserProfile userId={suspectId} />
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-red-400 to-pink-400"></div>
      </div>
    </div>
  );
};
export default Header;
