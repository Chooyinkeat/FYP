import { Metadata } from "next";
import React from "react";
import LostList from "@/components/LostList";
export const metadata: Metadata = {
  title: "Lost Items | VisionVault",
  description:
    "Browse and search reported lost items on VisionVault. Help reunite belongings with their rightful owners through intelligent image recognition and real-time updates.",
};

export default function LostItemsPage() {
  return (
    <>
      <section className="py-20 lg:py-25 xl:py-30">
        <div className="max-w-c-1280 mx-auto mt-15 px-4 md:px-8 xl:mt-20 xl:px-0">
          <div className="max-w-c-1280 mx-auto mt-15 px-4 md:px-8 xl:mt-20 xl:px-0">
            <LostList />
          </div>
        </div>
      </section>
    </>
  );
}
