import { Metadata } from "next";
import ManageReport from "@/components/Dashboard/ManageReport";
import { Suspense } from "react";
export const metadata: Metadata = {
  title: "Admin Dashboard | VisionVault",
  description:
    "Manage reports, monitor activity, and oversee lost item claims through the VisionVault admin dashboard.",
};

export default function Report() {
  return (
    <>
      <Suspense fallback={<p>Loading report form...</p>}>
        <ManageReport />
      </Suspense>
    </>
  );
}
