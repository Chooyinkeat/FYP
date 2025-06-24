import Signup from "@/components/Auth/Signup";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | Lost & Found Manager",
  description:
    "Create your account to start tracking and reporting lost and found items with ease.",
};

export default function Register() {
  return (
    <>
      <Signup />
    </>
  );
}
