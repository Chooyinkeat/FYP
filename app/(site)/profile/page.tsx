import { Metadata } from "next";
import React from "react";
import Profile from "@/components/Profile";

export const metadata: Metadata = {
  title: "Profile Page",
  // other metadata
  description: "Manage your profile settings and preferences.",
};
const ProfilePage = () => {
  return (
    <>
      <Profile />
    </>
  );
};

export default ProfilePage;
