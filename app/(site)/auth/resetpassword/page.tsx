import { Metadata } from "next";
import ResetPassword from "@/components/Auth/ResetPassword";

export const metadata: Metadata = {
  title: "Reset Password | Lost & Found Manager",
  description:
    "Secure reset password for Lost & Found Manager — track, report, and reunite lost items efficiently.",
};

const ResetPasswordPage = () => {
  return <ResetPassword />;
};

export default ResetPasswordPage;
