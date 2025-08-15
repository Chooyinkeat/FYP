import { Metadata } from "next";
import { Suspense } from "react";
import ManageUser from "@/components/Dashboard/ManageUser";

export const metadata: Metadata = {
  title: "Admin Dashboard | VisionVault",
  description:
    "Manage user account, settings, and preferences through the VisionVault admin dashboard.",
};

export default function Report() {
  return (
    <>
      <Suspense fallback={<p>Loading users...</p>}>
        <div className="p-4 md:p-6">
          <ManageUser />
        </div>
      </Suspense>
    </>
  );
}