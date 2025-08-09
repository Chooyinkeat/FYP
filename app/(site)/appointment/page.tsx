import { Metadata } from "next";
import Appointment from "@/components/Appointment";
import { Suspense } from "react";
export const metadata: Metadata = {
  title: "Lost Items | VisionVault",
  description:
    "Browse and search reported lost items on VisionVault. Help reunite belongings with their rightful owners through intelligent image recognition and real-time updates.",
};

export default function AppointmentPage() {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <Appointment />
      </Suspense>
    </>
  );
}
