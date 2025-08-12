import { Metadata } from "next";
import ReportList from "@/components/Dashboard/ReportList";

export const metadata: Metadata = {
  title: "Admin Dashboard | VisionVault",
  description:
    "Manage reports, monitor activity, and oversee lost item claims through the VisionVault admin dashboard.",
};

export default function Report() {
  return (
    <>
      <ReportList />
    </>
  );
}
