import { Metadata } from "next";
import AppointmentView from "@/components/Appointment/View";
export const metadata: Metadata = {
  title: "View Appointments | VisionVault",
  description:
    "View and manage your scheduled appointments on VisionVault. Stay organized with real-time updates and easy access to appointment details.",
};

export default function AppointmentPage() {
  return (
    <>
      <AppointmentView />
    </>
  );
}
