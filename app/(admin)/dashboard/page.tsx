import { Metadata } from "next";
import Dashboard from "@/components/Dashboard";

export const metadata: Metadata = {
  title: "Admin Dashboard | VisionVault",
  description:
    "Manage reports, monitor activity, and oversee lost item claims through the VisionVault admin dashboard.",
};

export default function DashboardPage() {
  return (
    <>
      <Dashboard />
    </>
  );
}
