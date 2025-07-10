import React from "react";
import Submit from "@/components/SubmitForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Report Lost Item - VisionVault",

  // other metadata
  description:
    "Submit a report for lost items securely and easily. VisionVault helps you reconnect with what matters using smart image recognition and instant chat support.",
};

const SupportPage = () => {
  return (
    <div className="pt-40 pb-20">
      <Submit />
    </div>
  );
};

export default SupportPage;
